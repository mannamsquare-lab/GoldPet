import 'dart:async';
import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_naver_map/flutter_naver_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:image_picker/image_picker.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:dio/dio.dart';
import 'package:http/http.dart' as http;
import '../../../core/theme/app_theme.dart';
import '../../../core/api/api_client.dart';
import '../data/walk_models.dart';
import '../data/walk_repository.dart';
import '../data/walk_local_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/widgets/goldpet_alert_dialog.dart';

/// Mixin that provides common walk tracking functionality:
/// - GPS location tracking with 3-tier filtering (accuracy, distance, speed)
/// - Timer with pause/resume support
/// - Path accumulation and distance calculation
/// - Spot recording (pee, poop, photo with camera/crop/upload)
/// - Pet marker rendering at start position
/// - Periodic local storage backup
/// - Walk widget (Android foreground service / iOS Live Activity)
///
/// Consumers must:
/// - Mix into a `State<T>` with WidgetsBindingObserver
/// - Call [initTracking] in initState (after super)
/// - Call [disposeTracking] in dispose (before super)
/// - Override [onWalkSaved] for post-save navigation
/// - Provide [walkRef] for Riverpod access
mixin WalkTrackingMixin<T extends StatefulWidget> on State<T> {
  // --- State ---
  bool trackingIsWalking = false;
  bool trackingIsSaving = false;
  bool trackingIsInitializing = true;
  bool trackingIsPaused = false;

  NaverMapController? trackingMapController;
  NLatLng? trackingInitialPosition;

  DateTime? _trackingStartTime;
  Timer? _trackingTimer;
  DateTime? _trackingPauseStartTime;
  Duration _trackingTotalPauseDuration = Duration.zero;

  final ValueNotifier<int> trackingDurationNotifier = ValueNotifier(0);
  final ValueNotifier<double> trackingDistanceNotifier = ValueNotifier(0.0);

  List<NLatLng> trackingPath = [];
  final List<WalkSpotDto> trackingSpots = [];
  final Set<NMarker> trackingMarkers = {};

  StreamSubscription<Position>? _trackingPositionSub;
  Position? _trackingLastAccepted;

  String trackingCurrentAddress = '';
  DateTime? _trackingLastGeocodingTime;
  String? _trackingPetImageUrl;
  List<int> _trackingPetIds = [];
  Uint8List? _trackingPetMarkerBytes;
  final Map<String, NOverlayImage> _trackingSpotMarkerImages = {};

  bool _trackingIsPublic = true;

  // GPS filtering thresholds
  static const double _maxAccuracyMeters = 20.0;
  static const double _maxWalkSpeedMps = 6.9; // ~25 km/h
  static const double _minDistanceMeters = 5.0;

  // Platform channels
  static const _walkWidgetChannel = MethodChannel('com.mannam.goldpet/walk_notification');
  static const _liveActivityChannel = MethodChannel('com.mannam.goldpet/walk_live_activity');

  // --- Abstract / overridable ---

  /// Called after walk is successfully saved to server or locally.
  /// Implementors should handle navigation (e.g. Navigator.pop).
  void onWalkSaved();

  /// Provide the Riverpod WidgetRef for repository access.
  /// Return null if not using Riverpod (CourseWalkScreen uses ApiClient directly).
  dynamic get walkRef;

  /// Optional: called on each GPS update with the new position.
  /// CourseWalkScreen uses this for deviation detection.
  void onLocationUpdate(Position position, NLatLng latLng) {}

  /// Optional: the courseId being followed (null for free walk).
  int? get followedCourseId => null;

  // --- Initialization ---

  void initTracking({bool isPublic = true}) {
    _trackingIsPublic = isPublic;
    WalkLocalStorage.initialize();
    _initializeLocation();
  }

  void disposeTracking() {
    _trackingTimer?.cancel();
    _trackingPositionSub?.cancel();
    _stopWalkWidget();
    trackingDurationNotifier.dispose();
    trackingDistanceNotifier.dispose();

    // Best-effort local save if walk was active
    if ((trackingIsWalking || trackingIsSaving) && _trackingStartTime != null && trackingPath.length >= 2) {
      try {
        final request = _buildWalkRequest(DateTime.now());
        WalkLocalStorage.saveWalkDataBestEffort(request);
      } catch (e) {
        debugPrint('[WalkTracking] Dispose emergency save failed: $e');
      }
    }
  }

  // --- Location initialization ---

  Future<void> _initializeLocation() async {
    debugPrint('[WalkTracking] _initializeLocation started');

    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      if (mounted) _showServiceDisabledDialog();
      return;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        if (mounted) {
          setState(() => trackingIsInitializing = false);
          _showPermissionDialog();
        }
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      if (mounted) {
        setState(() => trackingIsInitializing = false);
        _showPermissionDialog();
      }
      return;
    }

    try {
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(timeLimit: Duration(seconds: 5)),
      );
      trackingInitialPosition = NLatLng(position.latitude, position.longitude);
    } catch (e) {
      debugPrint('[WalkTracking] Error getting location: $e');
    } finally {
      if (mounted) {
        setState(() => trackingIsInitializing = false);
      }
      if (mounted && trackingInitialPosition != null) {
        startWalk();
      } else if (mounted && trackingInitialPosition == null) {
        Navigator.of(context).pop();
      }
    }
  }

  // --- Walk lifecycle ---

  Future<void> startWalk() async {
    // Pre-refresh token
    try {
      await ApiClient().refreshTokenIfNeeded();
    } catch (_) {}
    if (!mounted) return;

    // 산책 최소 저장 조건 설정값 fetch + 캐시
    try {
      final res = await ApiClient().dio.get('/api/v1/settings/public');
      if (res.statusCode == 200 && res.data is Map) {
        final data = res.data as Map;
        final prefs = await SharedPreferences.getInstance();
        if (data.containsKey('walkMinDurationSeconds')) {
          await prefs.setInt('walk_min_duration_seconds', (data['walkMinDurationSeconds'] as num).toInt());
        }
        if (data.containsKey('walkMinDistanceMeters')) {
          await prefs.setDouble('walk_min_distance_meters', (data['walkMinDistanceMeters'] as num).toDouble());
        }
      }
    } catch (_) {
      // non-fatal: 캐시된 값 또는 하드코딩 기본값 사용
    }
    if (!mounted) return;

    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      if (mounted) _showServiceDisabledDialog();
      return;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        if (mounted) _showPermissionDialog();
        return;
      }
    }
    if (permission == LocationPermission.deniedForever) {
      if (mounted) _showPermissionDialog();
      return;
    }

    // Request background permission
    if (permission == LocationPermission.whileInUse) {
      final shouldRequest = await _showBackgroundPermissionDialog();
      if (!mounted) return;
      if (shouldRequest) {
        await Geolocator.openAppSettings();
        if (!mounted) return;
        permission = await Geolocator.checkPermission();
      }
    }

    // Initialize state
    trackingDurationNotifier.value = 0;
    trackingDistanceNotifier.value = 0.0;
    trackingPath = [];
    trackingSpots.clear();
    trackingMarkers.clear();
    _trackingLastAccepted = null;
    trackingMapController?.clearOverlays();
    _trackingStartTime = DateTime.now();

    trackingIsPaused = false;
    _trackingPauseStartTime = null;
    _trackingTotalPauseDuration = Duration.zero;

    setState(() {
      trackingIsWalking = true;
    });

    _startWalkWidget();

    // Fetch pet data
    await _fetchPetData().timeout(const Duration(seconds: 3), onTimeout: () {});
    if (!mounted) return;

    await _buildPetMarkerImage();
    if (!mounted) return;
    await addPetStartMarker();

    // Timer
    _trackingTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_trackingStartTime != null && !trackingIsPaused) {
        final elapsed = DateTime.now().difference(_trackingStartTime!);
        final elapsedSeconds = (elapsed - _trackingTotalPauseDuration).inSeconds;
        trackingDurationNotifier.value = elapsedSeconds;
        _updateWalkWidget(elapsedSeconds, trackingDistanceNotifier.value);

        if (elapsedSeconds > 0 && elapsedSeconds % 60 == 0 && trackingPath.length >= 2) {
          _saveWalkDataLocally();
        }
      }
    });

    // GPS stream
    late final LocationSettings locationSettings;
    if (Platform.isAndroid) {
      locationSettings = AndroidSettings(accuracy: LocationAccuracy.best, distanceFilter: 3);
    } else if (Platform.isIOS) {
      locationSettings = AppleSettings(
        accuracy: LocationAccuracy.best,
        distanceFilter: 3,
        activityType: ActivityType.fitness,
        pauseLocationUpdatesAutomatically: false,
        allowBackgroundLocationUpdates: true,
        showBackgroundLocationIndicator: true,
      );
    } else {
      locationSettings = const LocationSettings(accuracy: LocationAccuracy.best, distanceFilter: 3);
    }

    _trackingPositionSub = Geolocator.getPositionStream(locationSettings: locationSettings).listen(
      (Position position) => _updateLocation(position),
    );
  }

  void _updateLocation(Position position) {
    if (trackingIsPaused) return;

    if (position.accuracy > _maxAccuracyMeters) {
      debugPrint('[Walk] Rejected: accuracy ${position.accuracy.toStringAsFixed(1)}m');
      return;
    }

    final latLng = NLatLng(position.latitude, position.longitude);

    if (trackingPath.isNotEmpty && _trackingLastAccepted != null) {
      final last = _trackingLastAccepted!;
      final dist = Geolocator.distanceBetween(
        last.latitude, last.longitude,
        position.latitude, position.longitude,
      );

      if (dist < _minDistanceMeters) return;

      final timeDiffSec = position.timestamp.difference(last.timestamp).inMilliseconds / 1000.0;
      if (timeDiffSec > 0) {
        final speedMps = dist / timeDiffSec;
        if (speedMps > _maxWalkSpeedMps) {
          debugPrint('[Walk] Rejected: speed ${(speedMps * 3.6).toStringAsFixed(1)}km/h');
          return;
        }
      }

      trackingDistanceNotifier.value += (dist / 1000.0);
      trackingPath.add(latLng);
      _trackingLastAccepted = position;
      updatePolyline();
    } else {
      trackingPath.add(latLng);
      _trackingLastAccepted = position;
      trackingInitialPosition = latLng;
      addPetStartMarker();
      updatePolyline();
    }

    trackingMapController?.updateCamera(NCameraUpdate.scrollAndZoomTo(target: latLng));
    _updateAddress(position.latitude, position.longitude);

    // Notify subclass (e.g. CourseWalkScreen for deviation detection)
    onLocationUpdate(position, latLng);
  }

  void updatePolyline({Color? color}) {
    if (trackingMapController == null || trackingPath.length < 2) return;
    final pathOverlay = NPathOverlay(
      id: 'walk_path',
      coords: trackingPath,
      color: color ?? AppColors.primary,
      width: 5,
    );
    trackingMapController!.addOverlay(pathOverlay);
  }

  // --- Pause / Resume ---

  void togglePause() {
    setState(() {
      if (trackingIsPaused) {
        _trackingTotalPauseDuration += DateTime.now().difference(_trackingPauseStartTime!);
        _trackingPauseStartTime = null;
        trackingIsPaused = false;
        _trackingPositionSub?.resume();
      } else {
        _trackingPauseStartTime = DateTime.now();
        trackingIsPaused = true;
        _trackingPositionSub?.pause();
      }
    });
  }

  // --- App lifecycle ---

  void handleAppResumed() {
    if (trackingIsWalking && _trackingStartTime != null && !trackingIsPaused) {
      final elapsed = DateTime.now().difference(_trackingStartTime!);
      trackingDurationNotifier.value = (elapsed - _trackingTotalPauseDuration).inSeconds;
    }
  }

  // --- Stop walk ---

  Future<void> stopWalk() async {
    if (!trackingIsWalking) return;

    final wasPaused = trackingIsPaused;
    final savedPauseStartTime = _trackingPauseStartTime;

    if (trackingIsPaused && _trackingPauseStartTime != null) {
      _trackingTotalPauseDuration += DateTime.now().difference(_trackingPauseStartTime!);
      _trackingPauseStartTime = null;
      trackingIsPaused = false;
    }

    final endTime = DateTime.now();
    final startTime = _trackingStartTime ?? endTime.subtract(Duration(seconds: trackingDurationNotifier.value));
    final durationSeconds = (endTime.difference(startTime) - _trackingTotalPauseDuration).inSeconds;

    if (durationSeconds < 1) {
      if (wasPaused) {
        trackingIsPaused = true;
        _trackingPauseStartTime = savedPauseStartTime;
        _trackingTotalPauseDuration -= DateTime.now().difference(savedPauseStartTime!);
      }
      if (mounted) showTrackingSnackBar('산책 시간이 너무 짧습니다. 조금 더 걸어주세요!');
      return;
    }

    // 최소 저장 조건 체크: 시간 >= 30초 AND 거리 >= 10m
    final prefs = await SharedPreferences.getInstance();
    final minDuration = prefs.getInt('walk_min_duration_seconds') ?? 30;
    final minDistanceM = prefs.getDouble('walk_min_distance_meters') ?? 10.0;
    final distanceMeters = trackingDistanceNotifier.value * 1000.0;

    if (durationSeconds < minDuration || distanceMeters < minDistanceM) {
      if (!mounted) return;
      final keepWalking = await showGoldPetConfirm(
        context,
        message: '산책 기록을 저장할 수 없습니다.\n\n'
            '최소 조건: $minDuration초 이상, ${minDistanceM.toInt()}m 이상\n'
            '현재 기록: $durationSeconds초, ${distanceMeters.toInt()}m\n\n'
            '산책을 계속하시겠습니까?',
        confirmText: '산책 계속하기',
        cancelText: '기록 삭제',
      );
      if (keepWalking) {
        // "산책 계속하기" — 일시정지 상태 복원 후 재개
        if (wasPaused) {
          trackingIsPaused = true;
          _trackingPauseStartTime = savedPauseStartTime;
          _trackingTotalPauseDuration -= DateTime.now().difference(savedPauseStartTime!);
        }
        return;
      }
      // "기록 삭제" — 산책 데이터 폐기
      _trackingTimer?.cancel();
      _trackingPositionSub?.cancel();
      _stopWalkWidget();
      await WalkLocalStorage.clearWalkData();
      if (mounted) {
        setState(() {
          trackingIsWalking = false;
          trackingIsSaving = false;
        });
        showTrackingSnackBar('산책 기록이 삭제되었습니다.');
        await Future.delayed(const Duration(milliseconds: 500));
        if (mounted) onWalkSaved();
      }
      return;
    }

    _trackingTimer?.cancel();
    _trackingPositionSub?.cancel();
    _stopWalkWidget();

    // Ensure path has at least 2 points
    if (trackingPath.length < 2) {
      try {
        final pos = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(timeLimit: Duration(seconds: 3)),
        );
        final currentLatLng = NLatLng(pos.latitude, pos.longitude);
        if (trackingPath.isEmpty) trackingPath.add(currentLatLng);
        if (trackingPath.length < 2) trackingPath.add(trackingPath.first);
      } catch (e) {
        if (trackingPath.isEmpty) {
          final fallback = trackingInitialPosition ?? const NLatLng(37.5665, 126.9780);
          trackingPath.add(fallback);
          trackingPath.add(fallback);
        } else {
          trackingPath.add(trackingPath.first);
        }
      }
    }

    final request = _buildWalkRequest(endTime, durationOverride: durationSeconds);

    setState(() {
      trackingIsWalking = false;
      trackingIsSaving = true;
    });

    try {
      final repo = walkRef?.read(walkRepositoryProvider);
      if (repo != null) {
        await repo.createWalk(request);
      } else {
        // Fallback: direct API call
        await ApiClient().dio.post('/api/v1/walks', data: request.toJson());
      }
      await WalkLocalStorage.clearWalkData();

      if (mounted) {
        setState(() => trackingIsSaving = false);
        showTrackingSnackBar('산책이 저장되었습니다!');
        await Future.delayed(const Duration(milliseconds: 500));
        if (mounted) onWalkSaved();
      }
    } catch (e) {
      debugPrint('[WalkTracking] Walk save error: $e');
      if (mounted) {
        setState(() => trackingIsSaving = false);
        if (e is DioException && e.response?.statusCode == 401) {
          await WalkLocalStorage.saveWalkData(request);
          showTrackingSnackBar('산책이 저장되었습니다! 다음 로그인 시 서버에 동기화됩니다.');
          await Future.delayed(const Duration(milliseconds: 500));
          if (mounted) onWalkSaved();
          return;
        }
        if (e is DioException && e.response?.statusCode == 400) {
          await WalkLocalStorage.clearWalkData();
          final prefs400 = await SharedPreferences.getInstance();
          final minDur = prefs400.getInt('walk_min_duration_seconds') ?? 30;
          final minDist = prefs400.getDouble('walk_min_distance_meters') ?? 10.0;
          showTrackingSnackBar(
            '산책 저장 조건 미충족: $minDur초 이상, ${minDist.toInt()}m 이상 필요',
          );
          if (mounted) onWalkSaved();
          return;
        }
        await _retrySaveWalk(request);
      }
    }
  }

  CreateWalkRequest _buildWalkRequest(DateTime endTime, {int? durationOverride}) {
    final startTime = _trackingStartTime ?? endTime.subtract(Duration(seconds: trackingDurationNotifier.value));
    final durationSeconds = durationOverride ?? (endTime.difference(startTime) - _trackingTotalPauseDuration).inSeconds;
    return CreateWalkRequest(
      startTime: startTime,
      endTime: endTime,
      distanceKm: trackingDistanceNotifier.value,
      durationSeconds: durationSeconds,
      path: trackingPath.map((e) => [e.latitude, e.longitude]).toList(),
      spots: List<WalkSpotDto>.from(trackingSpots),
      caloriesBurned: trackingDistanceNotifier.value * 50.0,
      petIds: _trackingPetIds,
      isPublic: _trackingIsPublic,
      followedCourseId: followedCourseId,
    );
  }

  Future<void> _retrySaveWalk(CreateWalkRequest request) async {
    const maxAttempts = 3;
    for (var attempt = 1; attempt <= maxAttempts; attempt++) {
      if (!mounted) return;
      final retry = await showGoldPetConfirm(
        context,
        message: '산책 저장에 실패했습니다. 다시 시도하시겠습니까? ($attempt/$maxAttempts)',
        confirmText: '재시도',
        cancelText: '취소',
      );
      if (!retry || !mounted) break;

      setState(() => trackingIsSaving = true);
      try {
        final repo = walkRef?.read(walkRepositoryProvider);
        if (repo != null) {
          await repo.createWalk(request);
        } else {
          await ApiClient().dio.post('/api/v1/walks', data: request.toJson());
        }
        await WalkLocalStorage.clearWalkData();
        if (mounted) {
          setState(() => trackingIsSaving = false);
          showTrackingSnackBar('산책이 저장되었습니다!');
          await Future.delayed(const Duration(milliseconds: 500));
          if (mounted) onWalkSaved();
          return;
        }
      } catch (e) {
        debugPrint('[WalkTracking] Retry save error: $e');
        if (mounted) setState(() => trackingIsSaving = false);
        if (e is DioException && e.response?.statusCode == 401) {
          await WalkLocalStorage.saveWalkData(request);
          if (mounted) {
            showTrackingSnackBar('산책이 저장되었습니다! 다음 로그인 시 서버에 동기화됩니다.');
            await Future.delayed(const Duration(milliseconds: 500));
            if (mounted) onWalkSaved();
          }
          return;
        }
        if (e is DioException && e.response?.statusCode == 400) {
          await WalkLocalStorage.clearWalkData();
          if (mounted) {
            setState(() => trackingIsSaving = false);
            final prefs400 = await SharedPreferences.getInstance();
            final minDur = prefs400.getInt('walk_min_duration_seconds') ?? 30;
            final minDist = prefs400.getDouble('walk_min_distance_meters') ?? 10.0;
            showTrackingSnackBar(
              '산책 저장 조건 미충족: $minDur초 이상, ${minDist.toInt()}m 이상 필요',
            );
            await Future.delayed(const Duration(milliseconds: 500));
            if (mounted) onWalkSaved();
          }
          return;
        }
      }
    }
    await WalkLocalStorage.saveWalkData(request);
    if (mounted) {
      setState(() => trackingIsSaving = false);
      showTrackingSnackBar('산책이 저장되었습니다! 다음 접속 시 자동으로 동기화됩니다.');
      await Future.delayed(const Duration(milliseconds: 500));
      if (mounted) onWalkSaved();
    }
  }

  // --- Spot recording ---

  Future<void> addSpot(String type) async {
    if (!trackingIsWalking) return;

    if (type == 'PHOTO') {
      await _addPhotoSpot();
      return;
    }

    try {
      final position = await Geolocator.getCurrentPosition();
      final latLng = NLatLng(position.latitude, position.longitude);

      final spot = WalkSpotDto(
        latitude: position.latitude,
        longitude: position.longitude,
        type: type,
        timestamp: DateTime.now(),
      );
      trackingSpots.add(spot);

      final spotIcon = await _getSpotMarkerImage(type);
      final marker = NMarker(
        id: 'spot_${trackingSpots.length}',
        position: latLng,
        icon: spotIcon,
        size: const Size(32, 32),
        anchor: const NPoint(0.5, 0.5),
      );
      trackingMarkers.add(marker);
      trackingMapController?.addOverlay(marker);

      if (mounted) showTrackingSnackBar('${_getSpotLabel(type)} 스팟이 기록되었습니다!');
    } catch (e) {
      debugPrint('Error adding spot: $e');
    }
  }

  Future<void> _addPhotoSpot() async {
    try {
      final position = await Geolocator.getCurrentPosition();
      final picker = ImagePicker();
      late CroppedFile finalCroppedFile;
      String? memoText;

      while (true) {
        final XFile? photo = await picker.pickImage(
          source: ImageSource.camera,
          imageQuality: 80,
          maxWidth: 1920,
          maxHeight: 1920,
        );
        if (photo == null) return;

        await Future.delayed(const Duration(milliseconds: 800));
        if (!mounted) return;
        setState(() {});

        final photoFile = File(photo.path);
        if (!await photoFile.exists()) {
          if (mounted) showTrackingSnackBar('사진 파일을 찾을 수 없습니다.');
          return;
        }

        CroppedFile? cropped;
        try {
          cropped = await ImageCropper().cropImage(
            sourcePath: photo.path,
            uiSettings: [
              AndroidUiSettings(
                toolbarTitle: '사진 편집',
                toolbarColor: AppColors.primary,
                toolbarWidgetColor: Colors.white,
                initAspectRatio: CropAspectRatioPreset.original,
                lockAspectRatio: false,
              ),
              IOSUiSettings(title: '사진 편집', doneButtonTitle: '저장', cancelButtonTitle: '취소'),
            ],
          );
        } catch (e) {
          debugPrint('ImageCropper error: $e');
          if (mounted) showTrackingSnackBar('사진 편집 오류가 발생했습니다.');
          return;
        }
        if (cropped == null) return;

        if (!mounted) return;
        final result = await showPhotoMemoSheet(cropped.path);
        if (!mounted) return;

        if (result == null) {
          return;
        } else if (result['retake'] == true) {
          continue;
        } else {
          finalCroppedFile = cropped;
          memoText = result['memo'] as String?;
          break;
        }
      }

      String? imageUrl;
      try {
        final fileName = finalCroppedFile.path.split('/').last;
        final formData = FormData.fromMap({
          'file': await MultipartFile.fromFile(finalCroppedFile.path, filename: fileName),
        });
        final response = await ApiClient().dio.post('/api/v1/files/upload', data: formData);
        imageUrl = response.data['url'] as String?;
      } catch (e) {
        debugPrint('Photo upload failed: $e');
      }

      if (!mounted) return;

      final latLng = NLatLng(position.latitude, position.longitude);
      final spot = WalkSpotDto(
        latitude: position.latitude,
        longitude: position.longitude,
        type: 'PHOTO',
        timestamp: DateTime.now(),
        imageUrl: imageUrl,
        note: (memoText != null && memoText.isNotEmpty) ? memoText : null,
      );
      trackingSpots.add(spot);

      final spotIcon = await _getSpotMarkerImage('PHOTO');
      final marker = NMarker(
        id: 'spot_${trackingSpots.length}',
        position: latLng,
        icon: spotIcon,
        size: const Size(32, 32),
        anchor: const NPoint(0.5, 0.5),
      );
      trackingMarkers.add(marker);
      trackingMapController?.addOverlay(marker);

      if (mounted) showTrackingSnackBar('사진이 저장되었습니다!');
    } catch (e) {
      debugPrint('Error adding photo spot: $e');
      if (mounted) {
        if (e is DioException && e.response?.statusCode == 401) return;
        showTrackingSnackBar('사진 저장 실패: 네트워크 오류가 발생했습니다.');
      }
    }
  }

  /// Override in subclass to provide photo memo bottom sheet.
  /// Returns {'memo': String} or {'retake': true} or null.
  Future<Map<String, dynamic>?> showPhotoMemoSheet(String photoPath);

  // --- Pet marker ---

  Future<void> _fetchPetData() async {
    try {
      final response = await ApiClient().dio.get('/api/v1/pets/my');
      final pets = response.data as List;
      if (pets.isNotEmpty) {
        _trackingPetImageUrl = pets.first['profileImageUrl'] as String?;
      }
      _trackingPetIds = pets.map<int>((p) => p['id'] as int).toList();
    } catch (e) {
      debugPrint('[WalkTracking] Failed to fetch pet data: $e');
    }
  }

  Future<void> _buildPetMarkerImage() async {
    ui.Image? petImage;
    if (_trackingPetImageUrl != null) {
      try {
        final imageUrl = _trackingPetImageUrl!.replaceFirst('http://', 'https://');
        final response = await http.get(Uri.parse(imageUrl));
        if (response.statusCode == 200) {
          final codec = await ui.instantiateImageCodec(response.bodyBytes);
          final frame = await codec.getNextFrame();
          petImage = frame.image;
        }
      } catch (e) {
        debugPrint('[WalkTracking] Failed to download pet image: $e');
      }
    }

    final recorder = ui.PictureRecorder();
    final canvas = Canvas(recorder);
    const markerWidth = 180.0;
    const markerHeight = 240.0;
    const circleCenter = Offset(90, 90);
    const circleRadius = 54.0;
    const borderWidth = 6.0;

    final borderPaint = Paint()..color = AppColors.primary..style = PaintingStyle.fill;
    canvas.drawCircle(circleCenter, circleRadius + borderWidth, borderPaint);

    if (petImage != null) {
      canvas.save();
      canvas.clipPath(Path()..addOval(Rect.fromCircle(center: circleCenter, radius: circleRadius)));
      final srcRect = Rect.fromLTWH(0, 0, petImage.width.toDouble(), petImage.height.toDouble());
      final dstRect = Rect.fromCircle(center: circleCenter, radius: circleRadius);
      canvas.drawImageRect(petImage, srcRect, dstRect, Paint());
      canvas.restore();
    } else {
      canvas.drawCircle(circleCenter, circleRadius, Paint()..color = Colors.white);
      canvas.drawCircle(circleCenter, 24, Paint()..color = AppColors.primary.withValues(alpha: 0.3));
    }

    final badgePaint = Paint()..color = AppColors.primary;
    canvas.drawRRect(
      RRect.fromRectAndRadius(const Rect.fromLTWH(48, 150, 84, 36), const Radius.circular(18)),
      badgePaint,
    );
    final textPainter = TextPainter(
      text: const TextSpan(
        text: '출발',
        style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: Colors.white),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    textPainter.paint(canvas, Offset((markerWidth - textPainter.width) / 2, 157));

    final linePaint = Paint()..color = AppColors.primary..strokeWidth = 3;
    canvas.drawLine(const Offset(90, 186), const Offset(90, 204), linePaint);

    const hereDotCenter = Offset(90, 216);
    canvas.drawCircle(hereDotCenter, 12, Paint()..color = Colors.white);
    canvas.drawCircle(hereDotCenter, 10, Paint()..color = const Color(0xFFFF5005));
    canvas.drawCircle(hereDotCenter, 7, Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3);

    final picture = recorder.endRecording();
    final img = await picture.toImage(markerWidth.toInt(), markerHeight.toInt());
    final byteData = await img.toByteData(format: ui.ImageByteFormat.png);
    _trackingPetMarkerBytes = byteData!.buffer.asUint8List();
  }

  Future<void> addPetStartMarker() async {
    if (_trackingPetMarkerBytes == null || trackingInitialPosition == null) return;
    try {
      final overlayImage = await NOverlayImage.fromByteArray(_trackingPetMarkerBytes!);
      final marker = NMarker(
        id: 'pet_start',
        position: trackingInitialPosition!,
        icon: overlayImage,
        size: const Size(60, 80),
        anchor: const NPoint(0.5, 1.0),
      );
      marker.setOnTapListener((_) {});
      trackingMapController?.addOverlay(marker);
    } catch (e) {
      debugPrint('[WalkTracking] Failed to add pet marker: $e');
    }
  }

  // --- Helpers ---

  Future<NOverlayImage> _getSpotMarkerImage(String type) async {
    if (_trackingSpotMarkerImages.containsKey(type)) return _trackingSpotMarkerImages[type]!;
    final pngAsset = switch (type) {
      'POOP' => 'assets/images/walk/marker_poop.png',
      'PEE' => 'assets/images/walk/marker_pee.png',
      'PHOTO' => 'assets/images/walk/marker_camera.png',
      _ => 'assets/images/walk/marker_poop.png',
    };
    final overlayImage = NOverlayImage.fromAssetImage(pngAsset);
    _trackingSpotMarkerImages[type] = overlayImage;
    return overlayImage;
  }

  Future<void> _updateAddress(double lat, double lng) async {
    final now = DateTime.now();
    if (_trackingLastGeocodingTime != null && now.difference(_trackingLastGeocodingTime!).inSeconds < 10) return;
    _trackingLastGeocodingTime = now;

    try {
      final response = await ApiClient().dio.get(
        '/api/v1/maps/reverse-geocode',
        queryParameters: {'lat': lat, 'lng': lng},
      );
      if (mounted) {
        setState(() => trackingCurrentAddress = response.data['address'] as String? ?? '');
      }
    } catch (e) {
      debugPrint('[WalkTracking] Reverse geocode failed: $e');
    }
  }

  Future<void> _saveWalkDataLocally() async {
    try {
      if (_trackingStartTime == null || trackingPath.length < 2) return;
      final request = _buildWalkRequest(DateTime.now());
      await WalkLocalStorage.saveWalkData(request);
    } catch (e) {
      debugPrint('[WalkTracking] Periodic local save failed: $e');
    }
  }

  String _getSpotLabel(String type) {
    switch (type) {
      case 'PEE': return '쉬';
      case 'POOP': return '응가';
      case 'PHOTO': return '사진';
      default: return '스팟';
    }
  }

  String formatDuration(int seconds) {
    final h = seconds ~/ 3600;
    final m = (seconds % 3600) ~/ 60;
    final s = seconds % 60;
    return '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  // --- Walk widget (platform notification/live activity) ---

  String _formatWidgetDuration(int seconds) {
    final h = seconds ~/ 3600;
    final m = (seconds % 3600) ~/ 60;
    final s = seconds % 60;
    if (h > 0) return '$h:${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  void _updateWalkWidget(int seconds, double distanceKm) {
    final time = formatDuration(seconds);
    final widgetDuration = _formatWidgetDuration(seconds);
    final calories = (distanceKm * 50).toStringAsFixed(0);

    if (Platform.isAndroid) {
      _walkWidgetChannel.invokeMethod('show', {
        'time': time,
        'distance': distanceKm.toStringAsFixed(2),
        'duration': widgetDuration,
        'calories': calories,
      });
    } else if (Platform.isIOS) {
      _liveActivityChannel.invokeMethod('update', {
        'distanceKm': distanceKm,
        'durationSeconds': seconds,
        'caloriesBurned': distanceKm * 50.0,
      });
    }
  }

  void _startWalkWidget() {
    if (Platform.isAndroid) {
      _walkWidgetChannel.invokeMethod('startForeground');
    } else if (Platform.isIOS) {
      _liveActivityChannel.invokeMethod('start');
    }
  }

  void _stopWalkWidget() {
    try {
      if (Platform.isAndroid) {
        _walkWidgetChannel.invokeMethod('cancel');
      } else if (Platform.isIOS) {
        _liveActivityChannel.invokeMethod('end');
      }
    } catch (_) {}
  }

  // --- Dialogs ---

  void _showServiceDisabledDialog() async {
    if (!mounted) return;
    final confirmed = await showGoldPetConfirm(
      context,
      message: '원활한 산책 기록을 위해\n위치 서비스를 켜주세요.',
      confirmText: '설정',
      cancelText: '취소',
    );
    if (confirmed) {
      await Geolocator.openLocationSettings();
      if (mounted) _initializeLocation();
    } else {
      setState(() => trackingIsInitializing = false);
      if (mounted) Navigator.of(context).pop();
    }
  }

  void _showPermissionDialog() async {
    if (!mounted) return;
    final confirmed = await showGoldPetConfirm(
      context,
      message: '산책 경로를 기록하려면 위치 권한이 필요합니다.\n설정에서 "앱을 사용하는 동안 허용"으로 변경해주세요.',
      confirmText: '설정으로 이동',
      cancelText: '취소',
    );
    if (confirmed) {
      await openAppSettings();
      if (mounted) {
        setState(() => trackingIsInitializing = true);
        _initializeLocation();
      }
    } else {
      setState(() => trackingIsInitializing = false);
      if (mounted) Navigator.of(context).pop();
    }
  }

  Future<bool> _showBackgroundPermissionDialog() async {
    if (!mounted) return false;
    return await showGoldPetConfirm(
      context,
      message: '화면이 꺼진 상태에서도 산책 경로를 정확하게 기록하려면\n"항상 허용" 권한이 필요합니다.',
      confirmText: '허용하기',
      cancelText: '나중에',
    );
  }

  Future<bool> showStopWalkDialog() async {
    return showGoldPetConfirm(
      context,
      message: '산책을 종료하고 기록을 저장하시겠습니까?',
      confirmText: '종료',
      cancelText: '취소',
    );
  }

  void showTrackingSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: const TextStyle(
            fontFamily: 'Pretendard',
            fontWeight: FontWeight.w500,
            fontSize: 14,
            color: Colors.white,
            letterSpacing: -0.28,
            height: 1.4,
          ),
        ),
        backgroundColor: const Color(0xE6614108),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        padding: const EdgeInsets.all(16),
        elevation: 8,
        duration: const Duration(seconds: 2),
      ),
    );
  }
}
