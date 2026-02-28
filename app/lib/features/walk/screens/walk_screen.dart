import 'dart:async';
import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_naver_map/flutter_naver_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:image_picker/image_picker.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:dio/dio.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_svg/flutter_svg.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/api/api_client.dart';
import '../data/walk_models.dart';
import '../data/walk_repository.dart';
import '../data/walk_local_storage.dart';
import '../../../core/widgets/goldpet_alert_dialog.dart';

/// Global stream for delivering spot actions to an existing WalkScreen
/// without pushing a duplicate. Used by deep link handler in hybrid_app.dart.
final walkSpotActionController = StreamController<String>.broadcast();

class WalkScreen extends ConsumerStatefulWidget {
  final String? initialSpotAction;

  /// Singleton guard: true when a WalkScreen is on the Navigator stack.
  /// Set in initState(), cleared in dispose(). Used by hybrid_app and native_bridge
  /// to prevent duplicate WalkScreen pushes from deep links or bridge calls.
  static bool isOnStack = false;

  /// Set by HybridWebView when auth expires during an active walk.
  /// The auth expiry dialog is deferred until the walk ends naturally.
  static bool authExpiredDuringWalk = false;

  const WalkScreen({super.key, this.initialSpotAction});

  @override
  ConsumerState<WalkScreen> createState() => _WalkScreenState();
}

class _WalkScreenState extends ConsumerState<WalkScreen> with WidgetsBindingObserver {
  bool _isWalking = false;
  NaverMapController? _mapController;
  bool _isInitializing = true;
  NLatLng? _initialPosition;
  final Key _mapKey = UniqueKey();

  // Walk Data
  DateTime? _startTime;
  Timer? _timer;

  // Use ValueNotifier to avoid full rebuilds
  final ValueNotifier<int> _durationNotifier = ValueNotifier(0);
  final ValueNotifier<double> _distanceNotifier = ValueNotifier(0.0);

  // Path data (no need for notifier as map updates imperatively)
  List<NLatLng> _path = [];
  final List<WalkSpotDto> _spots = [];
  final Set<NMarker> _markers = {};

  StreamSubscription<Position>? _positionStreamSubscription;
  StreamSubscription<String>? _spotActionSubscription;
  Position? _lastAcceptedPosition;

  // GPS filtering thresholds
  static const double _maxAccuracyMeters = 20.0;
  static const double _maxWalkSpeedMps = 4.2; // ~15 km/h
  static const double _minDistanceMeters = 5.0;

  // MethodChannel for platform-specific walk widget
  static const _walkWidgetChannel = MethodChannel('com.mannam.goldpet/walk_notification');
  static const _liveActivityChannel = MethodChannel('com.mannam.goldpet/walk_live_activity');

  String? _pendingSpotAction;

  // --- New state for redesign ---
  bool _isPaused = false;
  DateTime? _pauseStartTime;
  Duration _totalPauseDuration = Duration.zero;
  final DraggableScrollableController _sheetController = DraggableScrollableController();
  String _currentAddress = '';
  DateTime? _lastGeocodingTime;
  String? _petImageUrl;
  List<int> _petIds = [];
  Uint8List? _petMarkerBytes;
  final Map<String, NOverlayImage> _spotMarkerImages = {};

  // Design colors (from Figma)
  static const Color _panelBg = Color(0xFFEFE1C4);
  static const Color _actionBarBg = Color(0xFFF9ECD2);
  static const Color _handleColor = Color(0xFFA58A54);
  static const Color _statLabelColor = Color(0xFF727272);

  // Header constants
  static const double _headerToolbarHeight = 56.0;

  // Sheet size helpers
  double get _bottomSafeArea => MediaQuery.of(context).padding.bottom;
  double get _headerTotalHeight => MediaQuery.of(context).padding.top + _headerToolbarHeight;
  double get _mapAreaHeight => MediaQuery.of(context).size.height - _headerTotalHeight;
  double get _collapsedSheetSize => (60.0 + _bottomSafeArea) / _mapAreaHeight;
  double get _expandedSheetSize => (240.0 + _bottomSafeArea) / _mapAreaHeight;

  @override
  void initState() {
    super.initState();
    WalkScreen.isOnStack = true;
    WalkLocalStorage.initialize(); // Pre-cache SharedPreferences for dispose
    WidgetsBinding.instance.addObserver(this);
    // Subscribe to global spot action stream (for deep link actions on existing screen)
    _spotActionSubscription = walkSpotActionController.stream.listen((type) {
      if (type == 'STOP') {
        if (_isWalking) _stopWalk();
        return;
      }
      if (_isWalking) {
        _addSpot(type);
      } else {
        _pendingSpotAction = type;
      }
    });
    _initializeLocation();
    _fetchPetData();
    // Handle initial spot action from deep link (after location init)
    if (widget.initialSpotAction != null) {
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted && _isWalking) {
          _addSpot(widget.initialSpotAction!);
        }
      });
    }
  }

  @override
  void dispose() {
    debugPrint('[WalkScreen] dispose() called, isWalking=$_isWalking');
    // Best-effort local save if walk was active (data already on disk from periodic saves)
    if (_isWalking && _startTime != null && _path.length >= 2) {
      try {
        final request = CreateWalkRequest(
          startTime: _startTime!,
          endTime: DateTime.now(),
          distanceKm: _distanceNotifier.value,
          durationSeconds: _durationNotifier.value,
          path: _path.map((e) => [e.latitude, e.longitude]).toList(),
          spots: List<WalkSpotDto>.from(_spots),
          caloriesBurned: _distanceNotifier.value * 50.0,
          petIds: _petIds,
        );
        WalkLocalStorage.saveWalkDataBestEffort(request);
      } catch (e) {
        debugPrint('[WalkScreen] Dispose emergency save failed: $e');
      }
    }
    WalkScreen.isOnStack = false;
    WalkScreen.authExpiredDuringWalk = false;
    WidgetsBinding.instance.removeObserver(this);
    _timer?.cancel();
    _positionStreamSubscription?.cancel();
    _spotActionSubscription?.cancel();
    _stopWalkWidget();
    _durationNotifier.dispose();
    _distanceNotifier.dispose();
    _sheetController.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && _isWalking && _startTime != null) {
      if (!_isPaused) {
        // Subtract paused time from wall-clock diff on app resume
        final elapsed = DateTime.now().difference(_startTime!);
        _durationNotifier.value = (elapsed - _totalPauseDuration).inSeconds;
      }
      // If paused, don't update timer -- it stays frozen at the pause moment
    }
  }

  // --- Pet data and marker ---

  Future<void> _fetchPetData() async {
    try {
      final response = await ApiClient().dio.get('/api/v1/pets/my');
      final pets = response.data as List;
      if (pets.isNotEmpty) {
        _petImageUrl = pets.first['profileImageUrl'] as String?;
      }
      _petIds = pets.map<int>((p) => p['id'] as int).toList();
    } catch (e) {
      debugPrint('[WalkScreen] Failed to fetch pet data: $e');
    }
  }

  Future<void> _buildPetMarkerImage() async {
    // 1. Download pet image to bytes
    ui.Image? petImage;
    if (_petImageUrl != null) {
      try {
        final response = await http.get(Uri.parse(_petImageUrl!));
        if (response.statusCode == 200) {
          final codec = await ui.instantiateImageCodec(response.bodyBytes);
          final frame = await codec.getNextFrame();
          petImage = frame.image;
        }
      } catch (e) {
        debugPrint('[WalkScreen] Failed to download pet image: $e');
      }
    }

    // 2. Paint custom marker onto Canvas (3x resolution for crisp display)
    final recorder = ui.PictureRecorder();
    final canvas = Canvas(recorder);
    const markerWidth = 180.0;
    const markerHeight = 240.0;

    // --- Pet circle (large, prominent) ---
    const circleCenter = Offset(90, 90);
    const circleRadius = 54.0;
    const borderWidth = 6.0;

    // Draw colored border circle
    final borderPaint = Paint()
      ..color = AppColors.primary
      ..style = PaintingStyle.fill;
    canvas.drawCircle(circleCenter, circleRadius + borderWidth, borderPaint);

    if (petImage != null) {
      // Clip and draw pet image inside circle
      canvas.save();
      canvas.clipPath(Path()..addOval(Rect.fromCircle(center: circleCenter, radius: circleRadius)));
      final srcRect = Rect.fromLTWH(0, 0, petImage.width.toDouble(), petImage.height.toDouble());
      final dstRect = Rect.fromCircle(center: circleCenter, radius: circleRadius);
      canvas.drawImageRect(petImage, srcRect, dstRect, Paint());
      canvas.restore();
    } else {
      // Fallback: white circle inside border
      canvas.drawCircle(circleCenter, circleRadius, Paint()..color = Colors.white);
      canvas.drawCircle(circleCenter, 24, Paint()..color = AppColors.primary.withValues(alpha: 0.3));
    }

    // --- "출발" badge below circle ---
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

    // --- Connecting line from badge to "here" dot ---
    final linePaint = Paint()
      ..color = AppColors.primary
      ..strokeWidth = 3;
    canvas.drawLine(const Offset(90, 186), const Offset(90, 204), linePaint);

    // --- "Here" dot (red with white border) ---
    const hereDotCenter = Offset(90, 216);
    canvas.drawCircle(hereDotCenter, 12, Paint()..color = Colors.white);
    canvas.drawCircle(hereDotCenter, 10, Paint()..color = const Color(0xFFFF5005));
    canvas.drawCircle(hereDotCenter, 7, Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3);

    // 3. Convert to bytes
    final picture = recorder.endRecording();
    final img = await picture.toImage(markerWidth.toInt(), markerHeight.toInt());
    final byteData = await img.toByteData(format: ui.ImageByteFormat.png);
    _petMarkerBytes = byteData!.buffer.asUint8List();
  }

  Future<void> _addPetStartMarker() async {
    if (_petMarkerBytes == null || _initialPosition == null) return;
    try {
      // NOverlayImage.fromByteArray() returns Future -- MUST be awaited
      final overlayImage = await NOverlayImage.fromByteArray(_petMarkerBytes!);
      final marker = NMarker(
        id: 'pet_start',
        position: _initialPosition!,
        icon: overlayImage,
        size: const Size(60, 80),
        anchor: const NPoint(0.5, 1.0),
      );
      marker.setOnTapListener((_) {}); // prevent map tap-through
      _mapController?.addOverlay(marker);
    } catch (e) {
      debugPrint('[WalkScreen] Failed to add pet marker: $e');
    }
  }

  // --- Spot marker overlay images ---

  Future<NOverlayImage> _getSpotMarkerImage(String type) async {
    if (_spotMarkerImages.containsKey(type)) return _spotMarkerImages[type]!;

    final pngAsset = switch (type) {
      'POOP' => 'assets/images/walk/marker_poop.png',
      'PEE' => 'assets/images/walk/marker_pee.png',
      'PHOTO' => 'assets/images/walk/marker_camera.png',
      _ => 'assets/images/walk/marker_poop.png',
    };

    final overlayImage = NOverlayImage.fromAssetImage(pngAsset);
    _spotMarkerImages[type] = overlayImage;
    return overlayImage;
  }

  // --- Reverse geocoding ---

  Future<void> _updateAddress(double lat, double lng) async {
    // Throttle: max once every 10 seconds
    final now = DateTime.now();
    if (_lastGeocodingTime != null && now.difference(_lastGeocodingTime!).inSeconds < 10) return;
    _lastGeocodingTime = now;

    try {
      final response = await ApiClient().dio.get(
        '/api/v1/maps/reverse-geocode',
        queryParameters: {'lat': lat, 'lng': lng},
      );
      if (mounted) {
        setState(() => _currentAddress = response.data['address'] as String? ?? '');
      }
    } catch (e) {
      debugPrint('[WalkScreen] Reverse geocode failed: $e');
    }
  }

  // --- Pause / Resume ---

  void _togglePause() {
    setState(() {
      if (_isPaused) {
        // Resume
        _totalPauseDuration += DateTime.now().difference(_pauseStartTime!);
        _pauseStartTime = null;
        _isPaused = false;
        // Resume GPS stream
        _positionStreamSubscription?.resume();
      } else {
        // Pause
        _pauseStartTime = DateTime.now();
        _isPaused = true;
        // Pause GPS stream to save battery
        _positionStreamSubscription?.pause();
      }
    });
  }

  // --- Back navigation ---

  void _handleBackNavigation() async {
    if (_isWalking) {
      final confirmed = await showGoldPetConfirm(
        context,
        message: '산책을 종료하시겠습니까?',
        confirmText: '종료',
        cancelText: '취소',
      );
      if (confirmed) {
        _stopWalk();
      }
    } else {
      Navigator.of(context).pop();
    }
  }

  // --- Location and walk lifecycle (preserved) ---

  Future<void> _initializeLocation() async {
    debugPrint('[WalkScreen] _initializeLocation started');

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
          setState(() => _isInitializing = false);
          _showPermissionDialog();
        }
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      if (mounted) {
        setState(() => _isInitializing = false);
        _showPermissionDialog();
      }
      return;
    }

    try {
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          timeLimit: Duration(seconds: 5),
        ),
      );
      _initialPosition = NLatLng(position.latitude, position.longitude);
    } catch (e) {
      debugPrint('[WalkScreen] Error getting location: $e');
    } finally {
      if (mounted) {
        setState(() => _isInitializing = false);
      }
    }
  }

  void _showServiceDisabledDialog() async {
    if (!mounted) return;
    final confirmed = await showGoldPetConfirm(
      context,
      message: '원활한 산책 기록을 위해\n위치 서비스를 켜주세요.',
      confirmText: '설정',
      cancelText: '취소',
    );
    if (confirmed) {
      Geolocator.openLocationSettings();
    } else {
      setState(() => _isInitializing = false);
    }
  }

  void _showPermissionDialog() async {
    final confirmed = await showGoldPetConfirm(
      context,
      message: '산책 경로를 기록하려면 위치 권한이 필요합니다.\n설정에서 "앱을 사용하는 동안 허용"으로 변경해주세요.',
      confirmText: '설정으로 이동',
      cancelText: '취소',
    );
    if (confirmed) {
      openAppSettings();
    } else {
      setState(() => _isInitializing = false);
    }
  }

  String _formatWidgetDuration(int seconds) {
    final h = seconds ~/ 3600;
    final m = (seconds % 3600) ~/ 60;
    final s = seconds % 60;
    if (h > 0) {
      return '$h:${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
    }
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  void _updateWalkWidget(int seconds, double distanceKm) {
    final time = _formatDuration(seconds);
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
    } catch (_) {
      // Best-effort: widget cleanup may fail during dispose if engine is detaching
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

  void _startWalk() async {
    // 산책 시작 전 토큰 사전 갱신 (만료 확률 최소화, 실패해도 진행)
    try {
      await ApiClient().refreshTokenIfNeeded();
    } catch (_) {
      // Non-blocking: 갱신 실패해도 산책은 진행
    }

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

    // 백그라운드 위치 권한 요청 (whileInUse일 때만)
    if (permission == LocationPermission.whileInUse) {
      final shouldRequest = await _showBackgroundPermissionDialog();
      if (shouldRequest) {
        // Android 11+ / iOS 모두: requestPermission()은 "항상 허용"을 표시하지 않거나
        // 호출이 무한 대기할 수 있으므로, 설정 화면을 열어 사용자가 직접 변경하도록 함
        await Geolocator.openAppSettings();
        permission = await Geolocator.checkPermission();
      }
      // whileInUse로 유지되더라도 진행 (Android foreground service / iOS blue bar)
    }

    // Initialize state
    _durationNotifier.value = 0;
    _distanceNotifier.value = 0.0;
    _path = [];
    _spots.clear();
    _markers.clear();
    _lastAcceptedPosition = null;
    _mapController?.clearOverlays(); // Clear previous path/markers
    _startTime = DateTime.now();

    // Reset pause state
    _isPaused = false;
    _pauseStartTime = null;
    _totalPauseDuration = Duration.zero;

    setState(() {
      _isWalking = true;
    });

    _startWalkWidget();

    // Build and add pet marker at start position
    await _buildPetMarkerImage();
    await _addPetStartMarker();

    // Execute any pending spot action that arrived before walk started
    if (_pendingSpotAction != null) {
      final action = _pendingSpotAction!;
      _pendingSpotAction = null;
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted && _isWalking) _addSpot(action);
      });
    }

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_startTime != null && !_isPaused) {
        final elapsed = DateTime.now().difference(_startTime!);
        final elapsedSeconds = (elapsed - _totalPauseDuration).inSeconds;
        _durationNotifier.value = elapsedSeconds;
        _updateWalkWidget(elapsedSeconds, _distanceNotifier.value);

        // Periodic local save every 60 seconds (safety net for app kill/crash)
        if (elapsedSeconds > 0 && elapsedSeconds % 60 == 0 && _path.length >= 2) {
          _saveWalkDataLocally();
        }
      }
    });

    late final LocationSettings locationSettings;

    if (Platform.isAndroid) {
      // Foreground service is started separately via WalkForegroundService
      // (custom notification with spot buttons). No ForegroundNotificationConfig
      // needed here — that would create a duplicate plain-text notification.
      locationSettings = AndroidSettings(
        accuracy: LocationAccuracy.best,
        distanceFilter: 3,
      );
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
      locationSettings = const LocationSettings(
        accuracy: LocationAccuracy.best,
        distanceFilter: 3,
      );
    }

    _positionStreamSubscription =
        Geolocator.getPositionStream(locationSettings: locationSettings).listen(
          (Position position) {
            _updateLocation(position);
          },
        );
  }

  void _updateLocation(Position position) {
    // Guard: discard GPS events that arrive while paused
    // (StreamSubscription.pause() may buffer events on some platforms)
    if (_isPaused) return;

    // 1. Accuracy filter — reject unreliable GPS readings
    if (position.accuracy > _maxAccuracyMeters) {
      debugPrint('[Walk] Rejected: accuracy ${position.accuracy.toStringAsFixed(1)}m > ${_maxAccuracyMeters}m');
      return;
    }

    final latLng = NLatLng(position.latitude, position.longitude);

    if (_path.isNotEmpty && _lastAcceptedPosition != null) {
      final last = _lastAcceptedPosition!;
      final dist = Geolocator.distanceBetween(
        last.latitude,
        last.longitude,
        position.latitude,
        position.longitude,
      );

      // 2. Minimum distance filter — ignore micro-movements
      if (dist < _minDistanceMeters) return;

      // 3. Speed filter — reject GPS jumps (unrealistic teleportation)
      final timeDiffSec = position.timestamp
          .difference(last.timestamp)
          .inMilliseconds / 1000.0;
      if (timeDiffSec > 0) {
        final speedMps = dist / timeDiffSec;
        if (speedMps > _maxWalkSpeedMps) {
          debugPrint('[Walk] Rejected: speed ${(speedMps * 3.6).toStringAsFixed(1)}km/h > ${(_maxWalkSpeedMps * 3.6).toStringAsFixed(1)}km/h');
          return;
        }
      }

      _distanceNotifier.value += (dist / 1000.0);
      _path.add(latLng);
      _lastAcceptedPosition = position;
      _updatePolyline();
    } else {
      _path.add(latLng);
      _lastAcceptedPosition = position;
      _updatePolyline();
    }

    _mapController?.updateCamera(NCameraUpdate.scrollAndZoomTo(target: latLng));

    // Update reverse geocode address
    _updateAddress(position.latitude, position.longitude);
  }

  void _updatePolyline() {
    if (_mapController == null || _path.length < 2) return;

    final pathOverlay = NPathOverlay(
      id: 'walk_path',
      coords: _path,
      color: AppColors.primary,
      width: 5,
    );

    _mapController!.addOverlay(pathOverlay);
  }

  Future<void> _addSpot(String type) async {
    if (!_isWalking) return;

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

      _spots.add(spot);

      final spotIcon = await _getSpotMarkerImage(type);
      final marker = NMarker(
        id: 'spot_${_spots.length}',
        position: latLng,
        icon: spotIcon,
        size: const Size(32, 32),
        anchor: const NPoint(0.5, 0.5),
      );

      _markers.add(marker);
      _mapController?.addOverlay(marker);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${_getSpotLabel(type)} 스팟이 기록되었습니다!')),
        );
      }
    } catch (e) {
      debugPrint('Error adding spot: $e');
    }
  }

  Future<void> _addPhotoSpot() async {
    try {
      // 1. Get GPS location first (before camera opens)
      final position = await Geolocator.getCurrentPosition();

      final picker = ImagePicker();
      late CroppedFile finalCroppedFile;
      String? memoText;

      // 2. Retake loop
      while (true) {
        // 2a. Open camera
        final XFile? photo = await picker.pickImage(
          source: ImageSource.camera,
          imageQuality: 80,
          maxWidth: 1920,
          maxHeight: 1920,
        );
        // 2b. User cancelled camera
        if (photo == null) return;

        // 2c. Wait for map to recover after camera activity returns
        await Future.delayed(const Duration(milliseconds: 800));
        if (!mounted) return;
        setState(() {}); // Force rebuild to refresh map view

        // 2d. Verify photo file exists
        final photoFile = File(photo.path);
        if (!await photoFile.exists()) {
          debugPrint('Photo file not found: ${photo.path}');
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('사진 파일을 찾을 수 없습니다.')),
            );
          }
          return;
        }
        debugPrint('Photo file exists: ${photo.path} (${await photoFile.length()} bytes)');

        // 2e. Open image cropper
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
              IOSUiSettings(
                title: '사진 편집',
                doneButtonTitle: '저장',
                cancelButtonTitle: '취소',
              ),
            ],
          );
        } catch (e) {
          debugPrint('ImageCropper error: $e');
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('사진 편집 오류: $e')),
            );
          }
          return;
        }
        // 2f. Cropper cancelled
        if (cropped == null) return;

        // 2f. Show redesigned bottom sheet
        if (!mounted) return;
        final result = await showModalBottomSheet<Map<String, dynamic>>(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (ctx) => _PhotoMemoSheet(photoPath: cropped!.path),
        );
        if (!mounted) return;

        // 2g. Handle result
        if (result == null) {
          // Dismissed
          return;
        } else if (result['retake'] == true) {
          // Continue loop for retake
          continue;
        } else {
          // {'memo': text} — proceed
          finalCroppedFile = cropped;
          memoText = result['memo'] as String?;
          break;
        }
      }

      // 3. Upload using cropped file path
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

      // 4. Create spot with photo info
      final latLng = NLatLng(position.latitude, position.longitude);
      final spot = WalkSpotDto(
        latitude: position.latitude,
        longitude: position.longitude,
        type: 'PHOTO',
        timestamp: DateTime.now(),
        imageUrl: imageUrl,
        note: (memoText != null && memoText.isNotEmpty) ? memoText : null,
      );
      _spots.add(spot);

      // 5. Add marker on map
      final spotIcon = await _getSpotMarkerImage('PHOTO');
      final marker = NMarker(
        id: 'spot_${_spots.length}',
        position: latLng,
        icon: spotIcon,
        size: const Size(32, 32),
        anchor: const NPoint(0.5, 0.5),
      );
      _markers.add(marker);
      _mapController?.addOverlay(marker);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('사진이 저장되었습니다!')),
        );
      }
    } catch (e) {
      debugPrint('Error adding photo spot: $e');
      if (mounted) {
        if (e is DioException && e.response?.statusCode == 401) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('사진 저장 실패: 네트워크 오류가 발생했습니다')),
        );
      }
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


  /// 현재 산책 데이터를 로컬 저장소에 저장 (주기적 저장 + 비상 저장용)
  Future<void> _saveWalkDataLocally() async {
    try {
      if (_startTime == null || _path.length < 2) return;
      final endTime = DateTime.now();
      final durationSeconds = _durationNotifier.value;
      final request = CreateWalkRequest(
        startTime: _startTime!,
        endTime: endTime,
        distanceKm: _distanceNotifier.value,
        durationSeconds: durationSeconds,
        path: _path.map((e) => [e.latitude, e.longitude]).toList(),
        spots: List<WalkSpotDto>.from(_spots),
        caloriesBurned: _distanceNotifier.value * 50.0,
        petIds: _petIds,
      );
      await WalkLocalStorage.saveWalkData(request);
    } catch (e) {
      debugPrint('[WalkScreen] Periodic local save failed: $e');
    }
  }

  void _stopWalk() async {
    if (!_isWalking) return;

    // Stop-while-paused: account for ongoing pause duration
    if (_isPaused && _pauseStartTime != null) {
      _totalPauseDuration += DateTime.now().difference(_pauseStartTime!);
      _pauseStartTime = null;
      _isPaused = false;
    }

    _timer?.cancel();
    _positionStreamSubscription?.cancel();
    _stopWalkWidget();

    final endTime = DateTime.now();
    final startTime =
        _startTime ??
        endTime.subtract(Duration(seconds: _durationNotifier.value));

    // Compute correct duration excluding paused time
    final durationSeconds = (endTime.difference(startTime) - _totalPauseDuration).inSeconds;

    // Ensure path has at least 2 points (JTS LineString requirement)
    if (_path.length < 2) {
      try {
        final pos = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(timeLimit: Duration(seconds: 3)),
        );
        final currentLatLng = NLatLng(pos.latitude, pos.longitude);
        if (_path.isEmpty) {
          _path.add(currentLatLng);
        }
        // Add a second point (same location) to satisfy LineString minimum
        if (_path.length < 2) {
          _path.add(_path.first);
        }
      } catch (e) {
        // If location fails, use default or existing point
        if (_path.isEmpty) {
          final fallback = _initialPosition ?? const NLatLng(37.5665, 126.9780);
          _path.add(fallback);
          _path.add(fallback);
        } else {
          _path.add(_path.first);
        }
      }
    }

    final pathList = _path.map((e) => [e.latitude, e.longitude]).toList();

    // Calculate calories: ~50 kcal per km
    final caloriesBurned = _distanceNotifier.value * 50.0;

    final request = CreateWalkRequest(
      startTime: startTime,
      endTime: endTime,
      distanceKm: _distanceNotifier.value,
      durationSeconds: durationSeconds,
      path: pathList,
      spots: _spots,
      caloriesBurned: caloriesBurned,
      petIds: _petIds,
    );

    setState(() => _isWalking = false);

    try {
      await ref.read(walkRepositoryProvider).createWalk(request);
      // 성공 시 로컬 저장소의 보류 데이터 제거
      await WalkLocalStorage.clearWalkData();

      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('산책이 저장되었습니다!')));

        // 산책 중 인증 만료가 지연되었으면, 저장 완료 후 인증 만료 처리
        if (WalkScreen.authExpiredDuringWalk) {
          WalkScreen.authExpiredDuringWalk = false;
          debugPrint('[WalkScreen] Walk saved successfully, now handling deferred auth expiry');
          Navigator.of(context).popUntil((route) => route.isFirst);
          // dispose()에서 isOnStack = false 처리 후, 다음 프레임에서 인증 만료 알림
          WidgetsBinding.instance.addPostFrameCallback((_) {
            ApiClient.onAuthExpired?.call();
          });
          return;
        }
      }
    } catch (e) {
      if (mounted) {
        if (e is DioException && e.response?.statusCode == 401) {
          // 인증 만료: 산책 데이터를 로컬에 저장 후 인증 만료 처리
          await WalkLocalStorage.saveWalkData(request);
          debugPrint('[WalkScreen] Walk data saved locally due to auth expiry');
          WalkScreen.authExpiredDuringWalk = false;
          // 직접 pop (onAuthExpired의 walk-aware guard를 우회)
          if (mounted) {
            Navigator.of(context).popUntil((route) => route.isFirst);
          }
          return;
        }
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('저장 실패: 네트워크 오류가 발생했습니다')));
      }
    }
  }

  String _formatDuration(int seconds) {
    final h = seconds ~/ 3600;
    final m = (seconds % 3600) ~/ 60;
    final s = seconds % 60;
    return '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  // --- Build methods ---

  Widget _buildHeader() {
    return Container(
      color: AppColors.background,
      child: SafeArea(
        bottom: false,
        child: SizedBox(
          height: _headerToolbarHeight,
          child: Align(
            alignment: Alignment.centerLeft,
            child: GestureDetector(
              onTap: _handleBackNavigation,
              child: Padding(
                padding: const EdgeInsets.only(left: 16),
                child: Icon(
                  Icons.arrow_back_ios_new,
                  size: 20,
                  color: AppColors.primary,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: Column(
        children: [
          // Header bar (status bar + toolbar)
          _buildHeader(),

          // Map + overlays fill remaining space
          Expanded(
            child: Stack(
              children: [
                // Layer 0: NaverMap fills the map area
                Positioned.fill(
                  child: _isInitializing
                      ? const Center(child: CircularProgressIndicator())
                      : NaverMap(
                          key: _mapKey,
                          options: NaverMapViewOptions(
                            initialCameraPosition: _initialPosition != null
                                ? NCameraPosition(target: _initialPosition!, zoom: 16)
                                : const NCameraPosition(
                                    target: NLatLng(37.5665, 126.9780),
                                    zoom: 16,
                                  ),
                            locationButtonEnable: true,
                            logoClickEnable: false,
                            consumeSymbolTapEvents: false,
                          ),
                          onMapReady: (controller) {
                            _mapController = controller;
                            controller.setLocationTrackingMode(
                              NLocationTrackingMode.follow,
                            );
                          },
                        ),
                ),

                // Layer 1: Location chip (top-right of map area)
                if (_isWalking && _currentAddress.isNotEmpty)
                  Positioned(
                    top: 12,
                    right: 16,
                    child: _LocationChip(address: _currentAddress),
                  ),

                // Layer 2: DraggableScrollableSheet info panel
                if (_isWalking)
                  _buildInfoPanel(),

                // Layer 3: Walk controls
                if (_isWalking)
                  _buildWalkControls(),

                // Layer 4: Start button
                if (!_isWalking && !_isInitializing)
                  _buildStartButton(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoPanel() {
    return DraggableScrollableSheet(
      controller: _sheetController,
      initialChildSize: _expandedSheetSize,
      minChildSize: _collapsedSheetSize,
      maxChildSize: _expandedSheetSize,
      snap: true,
      snapSizes: [_collapsedSheetSize, _expandedSheetSize],
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: _panelBg,
            borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
            boxShadow: [
              BoxShadow(color: Colors.black12, blurRadius: 8, offset: Offset(0, -2)),
            ],
          ),
          child: SingleChildScrollView(
            controller: scrollController,
            child: Column(
              children: [
                // Drag handle
                _buildDragHandle(),
                // Stats row
                _buildStatsRow(),
                const SizedBox(height: 16),
                // Action buttons row
                _buildActionButtonsRow(),
                // Bottom safe area padding
                SizedBox(height: _bottomSafeArea),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildDragHandle() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Center(
        child: Container(
          width: 40,
          height: 4,
          decoration: BoxDecoration(
            color: _handleColor,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
      ),
    );
  }

  Widget _buildStatsRow() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        children: [
          // Distance
          Expanded(
            child: ValueListenableBuilder<double>(
              valueListenable: _distanceNotifier,
              builder: (context, distance, _) {
                return _WalkStat(
                  value: distance.toStringAsFixed(2),
                  unit: 'km',
                  label: '거리',
                );
              },
            ),
          ),
          // Time
          Expanded(
            child: ValueListenableBuilder<int>(
              valueListenable: _durationNotifier,
              builder: (context, seconds, _) {
                return _WalkStat(
                  value: _formatDuration(seconds),
                  label: '시간',
                );
              },
            ),
          ),
          // Calories
          Expanded(
            child: ValueListenableBuilder<double>(
              valueListenable: _distanceNotifier,
              builder: (context, distance, _) {
                return _WalkStat(
                  value: (distance * 50).toStringAsFixed(0),
                  unit: 'Kcal',
                  label: '칼로리',
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtonsRow() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: _actionBarBg,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _SpotButton(
              label: '응가',
              svgAsset: 'assets/images/walk/icon_poop.svg',
              onTap: () => _addSpot('POOP'),
            ),
            _SpotButton(
              label: '쉬',
              svgAsset: 'assets/images/walk/icon_pee.svg',
              onTap: () => _addSpot('PEE'),
            ),
            _SpotButton(
              label: '사진',
              svgAsset: 'assets/images/walk/icon_camera.svg',
              onTap: () => _addSpot('PHOTO'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWalkControls() {
    return ListenableBuilder(
      listenable: _sheetController,
      builder: (context, child) {
        double sheetHeight;
        try {
          sheetHeight = _sheetController.size * _mapAreaHeight;
        } catch (_) {
          sheetHeight = _expandedSheetSize * _mapAreaHeight;
        }
        return Positioned(
          right: 16,
          bottom: sheetHeight + 16,
          child: child!,
        );
      },
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Stop button
          GestureDetector(
            onTap: () async {
              final confirmed = await showGoldPetConfirm(
                context,
                message: '산책을 종료하고 기록을 저장하시겠습니까?',
                confirmText: '종료',
                cancelText: '취소',
              );
              if (confirmed) _stopWalk();
            },
            child: Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF353D4C).withValues(alpha: 0.1),
                    blurRadius: 20,
                    offset: const Offset(0, 12),
                  ),
                ],
              ),
              child: Center(
                child: Container(
                  width: 14,
                  height: 14,
                  decoration: BoxDecoration(
                    color: _handleColor,
                    borderRadius: BorderRadius.circular(1),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          // Play/Pause button
          GestureDetector(
            onTap: _togglePause,
            child: Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF353D4C).withValues(alpha: 0.1),
                    blurRadius: 20,
                    offset: const Offset(0, 12),
                  ),
                ],
              ),
              child: Center(
                child: _isPaused
                    ? CustomPaint(
                        size: const Size(14, 14),
                        painter: _PlayIconPainter(color: _handleColor),
                      )
                    : Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 6,
                            height: 14,
                            decoration: BoxDecoration(
                              color: _handleColor,
                              borderRadius: BorderRadius.circular(1),
                            ),
                          ),
                          const SizedBox(width: 3),
                          Container(
                            width: 6,
                            height: 14,
                            decoration: BoxDecoration(
                              color: _handleColor,
                              borderRadius: BorderRadius.circular(1),
                            ),
                          ),
                        ],
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStartButton() {
    return Positioned(
      left: 24,
      right: 24,
      bottom: 40 + MediaQuery.of(context).padding.bottom,
      child: ElevatedButton(
        onPressed: _startWalk,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 56),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(28),
          ),
          elevation: 4,
        ),
        child: const Text(
          '산책 시작',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

// --- Extracted widgets ---

class _WalkStat extends StatelessWidget {
  final String value;
  final String? unit;
  final String label;

  const _WalkStat({required this.value, this.unit, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            Text(
              value,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
            if (unit != null) ...[
              const SizedBox(width: 2),
              Text(
                unit!,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: AppColors.primary,
                ),
              ),
            ],
          ],
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: _WalkScreenState._statLabelColor),
        ),
      ],
    );
  }
}

class _SpotButton extends StatelessWidget {
  final String label;
  final String svgAsset;
  final VoidCallback onTap;

  const _SpotButton({
    required this.label,
    required this.svgAsset,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        child: Column(
          children: [
            SizedBox(
              width: 40,
              height: 40,
              child: SvgPicture.asset(svgAsset),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w500,
                color: Color(0xFF727272),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LocationChip extends StatelessWidget {
  final String address;
  const _LocationChip({required this.address});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4)],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.location_on, size: 16, color: AppColors.primary),
          const SizedBox(width: 4),
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 200),
            child: Text(
              address,
              style: const TextStyle(fontSize: 12, color: AppColors.textPrimary),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

/// Redesigned photo + memo bottom sheet for walk photo spots
class _PhotoMemoSheet extends StatefulWidget {
  final String photoPath;
  const _PhotoMemoSheet({required this.photoPath});

  @override
  State<_PhotoMemoSheet> createState() => _PhotoMemoSheetState();
}

class _PhotoMemoSheetState extends State<_PhotoMemoSheet> {
  final _textController = TextEditingController();

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFFFFF7E6),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.fromLTRB(20, 12, 20, 24 + bottomInset),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle bar
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[400],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 8),
          // Section title: 사진
          const Text(
            '사진',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Color(0xFF333333),
            ),
          ),
          const SizedBox(height: 8),
          // Photo preview
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Image.file(
              File(widget.photoPath),
              height: 220,
              width: double.infinity,
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(height: 20),
          // Section title: 메모
          const Text(
            '메모',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Color(0xFF333333),
            ),
          ),
          const SizedBox(height: 8),
          // Memo text field
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
            ),
            padding: const EdgeInsets.all(12),
            child: TextField(
              controller: _textController,
              maxLength: 100,
              maxLines: 3,
              decoration: const InputDecoration(
                hintText: '이 장소에 대한 메모를 남겨보세요.',
                border: InputBorder.none,
                counterText: '',
              ),
            ),
          ),
          const SizedBox(height: 4),
          // Character counter
          Align(
            alignment: Alignment.centerRight,
            child: ValueListenableBuilder<TextEditingValue>(
              valueListenable: _textController,
              builder: (context, value, _) {
                return Text(
                  '${value.text.length}/100자',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF999999),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 24),
          // Action buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  icon: const Icon(Icons.camera_alt, size: 18),
                  label: const Text('다시 촬영'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF614108),
                    side: const BorderSide(color: Color(0xFF614108)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () => Navigator.pop(context, <String, dynamic>{'retake': true}),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF614108),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () => Navigator.pop(context, <String, dynamic>{'memo': _textController.text}),
                  child: const Text('저장'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _PlayIconPainter extends CustomPainter {
  final Color color;
  _PlayIconPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width, size.height / 2)
      ..lineTo(0, size.height)
      ..close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
