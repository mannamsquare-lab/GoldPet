import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_naver_map/flutter_naver_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/api/api_client.dart';
import '../data/walk_models.dart';
import '../data/walk_repository.dart';

class WalkScreen extends ConsumerStatefulWidget {
  const WalkScreen({super.key});

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
  Position? _lastAcceptedPosition;

  // GPS filtering thresholds
  static const double _maxAccuracyMeters = 20.0;
  static const double _maxWalkSpeedMps = 4.2; // ~15 km/h
  static const double _minDistanceMeters = 5.0;

  // Lock screen notification (Android only)
  final FlutterLocalNotificationsPlugin _walkNotification = FlutterLocalNotificationsPlugin();
  static const int _walkNotificationId = 9999;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initializeLocation();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _timer?.cancel();
    _positionStreamSubscription?.cancel();
    _cancelWalkNotification();
    _durationNotifier.dispose();
    _distanceNotifier.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && _isWalking && _startTime != null) {
      // 화면 복귀 시 실제 경과 시간으로 즉시 보정
      _durationNotifier.value = DateTime.now().difference(_startTime!).inSeconds;
    }
  }

  Future<void> _initializeLocation() async {
    // ... (same permission logic)
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

  void _showServiceDisabledDialog() {
    if (!mounted) return;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('위치 서비스 꺼짐'),
        content: const Text('원활한 산책 기록을 위해 위치 서비스를 켜주세요.'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() => _isInitializing = false);
            },
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Geolocator.openLocationSettings();
            },
            child: const Text('설정'),
          ),
        ],
      ),
    );
  }

  void _showPermissionDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('위치 권한 필요'),
        content: const Text(
          '산책 경로를 기록하려면 위치 권한이 필요합니다.\n설정에서 "앱을 사용하는 동안 허용"으로 변경해주세요.',
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() => _isInitializing = false);
            },
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              openAppSettings();
            },
            child: const Text('설정으로 이동'),
          ),
        ],
      ),
    );
  }

  void _updateWalkNotification(int seconds, double distanceKm) {
    if (!Platform.isAndroid) return;
    final time = _formatDuration(seconds);
    final dist = distanceKm.toStringAsFixed(2);
    final cal = (distanceKm * 50).toStringAsFixed(0);

    final androidDetails = AndroidNotificationDetails(
      'walk_tracking',
      '산책 추적',
      channelDescription: '산책 중 실시간 정보 표시',
      importance: Importance.low,
      priority: Priority.low,
      ongoing: true,
      autoCancel: false,
      showWhen: false,
      silent: true,
      styleInformation: BigTextStyleInformation(
        '거리: $dist km  |  칼로리: $cal kcal',
        contentTitle: '산책 중  $time',
      ),
    );

    _walkNotification.show(
      id: _walkNotificationId,
      title: '산책 중  $time',
      body: '거리: $dist km  |  칼로리: $cal kcal',
      notificationDetails: NotificationDetails(android: androidDetails),
    );
  }

  void _cancelWalkNotification() {
    _walkNotification.cancel(id: _walkNotificationId);
  }

  Future<bool> _showBackgroundPermissionDialog() async {
    if (!mounted) return false;
    return await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('백그라운드 위치 권한'),
        content: const Text(
          '화면이 꺼진 상태에서도 산책 경로를 정확하게 기록하려면 '
          '"항상 허용" 권한이 필요합니다.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('나중에'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('허용하기'),
          ),
        ],
      ),
    ) ?? false;
  }

  void _startWalk() async {
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
        if (Platform.isAndroid) {
          // Android 11+: requestPermission()은 "항상 허용" 다이얼로그를 표시하지 않음
          await Geolocator.openAppSettings();
          permission = await Geolocator.checkPermission();
        } else {
          permission = await Geolocator.requestPermission();
        }
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

    setState(() {
      _isWalking = true;
    });

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_startTime != null) {
        _durationNotifier.value = DateTime.now().difference(_startTime!).inSeconds;
        _updateWalkNotification(_durationNotifier.value, _distanceNotifier.value);
      }
    });

    late final LocationSettings locationSettings;

    if (Platform.isAndroid) {
      locationSettings = AndroidSettings(
        accuracy: LocationAccuracy.best,
        distanceFilter: 3,
        foregroundNotificationConfig: const ForegroundNotificationConfig(
          notificationTitle: "GoldPet 산책 중",
          notificationText: "산책 경로를 기록하고 있습니다",
          enableWakeLock: true,
          setOngoing: true,
        ),
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

      final marker = NMarker(
        id: 'spot_${_spots.length}',
        position: latLng,
        caption: NOverlayCaption(text: _getSpotLabel(type)),
        iconTintColor: _getSpotColor(type),
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

      // 2. Open camera
      final picker = ImagePicker();
      final XFile? photo = await picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 80,
        maxWidth: 1920,
        maxHeight: 1920,
      );
      if (photo == null) return;

      // Wait for widget to be ready after camera returns
      await Future.delayed(const Duration(milliseconds: 300));
      if (!mounted) return;

      // 3. Show memo bottom sheet (community write style)
      final note = await showModalBottomSheet<String>(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (ctx) => _PhotoMemoSheet(photoPath: photo.path),
      );
      if (!mounted) return;

      // 4. Upload photo to server
      String? imageUrl;
      try {
        final formData = FormData.fromMap({
          'file': await MultipartFile.fromFile(photo.path, filename: photo.name),
        });
        final response = await ApiClient().dio.post('/api/v1/files/upload', data: formData);
        imageUrl = response.data['url'] as String?;
      } catch (e) {
        debugPrint('Photo upload failed: $e');
      }

      if (!mounted) return;

      // 5. Create spot with photo info
      final latLng = NLatLng(position.latitude, position.longitude);
      final spot = WalkSpotDto(
        latitude: position.latitude,
        longitude: position.longitude,
        type: 'PHOTO',
        timestamp: DateTime.now(),
        imageUrl: imageUrl,
        note: (note != null && note.isNotEmpty) ? note : null,
      );
      _spots.add(spot);

      // 6. Add marker on map
      final marker = NMarker(
        id: 'spot_${_spots.length}',
        position: latLng,
        caption: NOverlayCaption(
          text: (note != null && note.isNotEmpty) ? note : '사진',
        ),
        iconTintColor: _getSpotColor('PHOTO'),
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
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('사진 저장 실패: $e')),
        );
      }
    }
  }

  String _getSpotLabel(String type) {
    switch (type) {
      case 'PEE': return '배변(소)';
      case 'POOP': return '배변(대)';
      case 'PHOTO': return '사진';
      default: return '스팟';
    }
  }

  Color _getSpotColor(String type) {
    switch (type) {
      case 'PEE': return AppColors.warning;
      case 'POOP': return AppColors.primaryDark;
      case 'PHOTO': return AppColors.info;
      default: return Colors.grey;
    }
  }

  void _stopWalk() async {
    if (!_isWalking) return;

    _timer?.cancel();
    _positionStreamSubscription?.cancel();
    _cancelWalkNotification();

    final endTime = DateTime.now();
    final startTime =
        _startTime ??
        endTime.subtract(Duration(seconds: _durationNotifier.value));

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
      durationSeconds: _durationNotifier.value,
      path: pathList,
      spots: _spots,
      caloriesBurned: caloriesBurned,
    );

    setState(() => _isWalking = false);

    try {
      await ref.read(walkRepositoryProvider).createWalk(request);

      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('산책이 저장되었습니다! 🐾')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('저장 실패: $e')));
      }
    }
  }

  String _formatDuration(int seconds) {
    final h = seconds ~/ 3600;
    final m = (seconds % 3600) ~/ 60;
    final s = seconds % 60;
    return '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background, // #FFF7E6
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          color: AppColors.primary, // #614108
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          '산책',
          style: TextStyle(
            color: AppColors.primary,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          Expanded(
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
                      // Always enable location tracking to center on current position
                      controller.setLocationTrackingMode(
                        NLocationTrackingMode.follow,
                      );
                    },
                  ),
          ),
          Container(
            padding: EdgeInsets.fromLTRB(24, 24, 24, 24 + MediaQuery.of(context).padding.bottom),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 10,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: Column(
              children: [
                if (_isWalking) ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      ValueListenableBuilder<int>(
                        valueListenable: _durationNotifier,
                        builder: (context, seconds, _) {
                          return _WalkStat(
                            value: _formatDuration(seconds),
                            label: '시간',
                          );
                        },
                      ),
                      ValueListenableBuilder<double>(
                        valueListenable: _distanceNotifier,
                        builder: (context, distance, _) {
                          return _WalkStat(
                            value: '${distance.toStringAsFixed(2)} km',
                            label: '거리',
                          );
                        },
                      ),
                      ValueListenableBuilder<double>(
                        valueListenable: _distanceNotifier,
                        builder: (context, distance, _) {
                          return _WalkStat(
                            value: '${(distance * 50).toStringAsFixed(0)} kcal',
                            label: '칼로리',
                          );
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  // Spot Buttons
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _SpotButton(
                          label: '쉬~',
                          icon: Icons.water_drop,
                          color: AppColors.warning,
                          onTap: () => _addSpot('PEE')),
                      _SpotButton(
                          label: '응가',
                          icon: Icons.circle,
                          color: AppColors.primaryDark,
                          onTap: () => _addSpot('POOP')),
                      _SpotButton(
                          label: '사진',
                          icon: Icons.camera_alt,
                          color: AppColors.info,
                          onTap: () => _addSpot('PHOTO')),
                    ],
                  ),
                  const SizedBox(height: 20),
                ],
                ElevatedButton(
                  onPressed: _isWalking ? _stopWalk : _startWalk,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _isWalking
                        ? AppColors.error
                        : AppColors.primary,
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 56),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(28),
                    ),
                  ),
                  child: Text(
                    _isWalking ? '산책 종료' : '산책 시작',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _WalkStat extends StatelessWidget {
  final String value;
  final String label;

  const _WalkStat({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
        ),
      ],
    );
  }
}

class _SpotButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _SpotButton({
    required this.label,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.2),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

/// Community write page style bottom sheet for photo memo
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
    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.85,
        ),
        decoration: const BoxDecoration(
          color: Color(0xFFFFF7E6),
          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        ),
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Handle bar
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: Colors.grey[400],
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                // Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      '사진 메모',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: AppColors.textSecondary),
                      onPressed: () => Navigator.pop(context, ''),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Photo preview
                ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Image.file(
                    File(widget.photoPath),
                    height: 200,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                ),
                const SizedBox(height: 20),
                // Label
                const Text(
                  '메모',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                // Textarea
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: TextField(
                    controller: _textController,
                    maxLines: 5,
                    decoration: const InputDecoration(
                      hintText: '이 장소에 대한 메모를 남겨보세요.',
                      hintStyle: TextStyle(
                        color: AppColors.textHint,
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                      ),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.all(16),
                    ),
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                // Submit button
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context, _textController.text),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      '저장하기',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
