import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_naver_map/flutter_naver_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../core/theme/app_theme.dart';
import '../data/walk_models.dart';
import '../data/walk_repository.dart';

class WalkScreen extends ConsumerStatefulWidget {
  const WalkScreen({super.key});

  @override
  ConsumerState<WalkScreen> createState() => _WalkScreenState();
}

class _WalkScreenState extends ConsumerState<WalkScreen> {
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

  @override
  void initState() {
    super.initState();
    _initializeLocation();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _positionStreamSubscription?.cancel();
    _durationNotifier.dispose();
    _distanceNotifier.dispose();
    super.dispose();
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

    // Initialize state
    _durationNotifier.value = 0;
    _distanceNotifier.value = 0.0;
    _path = [];
    _spots.clear();
    _markers.clear();
    _mapController?.clearOverlays(); // Clear previous path/markers
    _startTime = DateTime.now();

    setState(() {
      _isWalking = true;
    });

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      _durationNotifier.value++;
    });

    const locationSettings = LocationSettings(accuracy: LocationAccuracy.best);

    _positionStreamSubscription =
        Geolocator.getPositionStream(locationSettings: locationSettings).listen(
          (Position position) {
            _updateLocation(position);
          },
        );
  }

  void _updateLocation(Position position) {
    final latLng = NLatLng(position.latitude, position.longitude);

    if (_path.isNotEmpty) {
      final last = _path.last;
      final dist = Geolocator.distanceBetween(
        last.latitude,
        last.longitude,
        position.latitude,
        position.longitude,
      );
      if (dist > 2.0) {
        _distanceNotifier.value += (dist / 1000.0);
        _path.add(latLng);
        _updatePolyline();
      }
    } else {
      _path.add(latLng);
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

      // Add Marker
      final marker = NMarker(
        id: 'spot_${_spots.length}',
        position: latLng,
        caption: NOverlayCaption(text: _getSpotLabel(type)),
        iconTintColor: _getSpotColor(type),
      );
      
      _markers.add(marker);
      _mapController?.addOverlay(marker);

      if(mounted) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('${_getSpotLabel(type)} 스팟이 기록되었습니다!')),
         );
      }

    } catch (e) {
      debugPrint('Error adding spot: $e');
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

    final endTime = DateTime.now();
    final startTime =
        _startTime ??
        endTime.subtract(Duration(seconds: _durationNotifier.value));

    final pathList = _path.map((e) => [e.latitude, e.longitude]).toList();

    final request = CreateWalkRequest(
      startTime: startTime,
      endTime: endTime,
      distanceKm: _distanceNotifier.value,
      durationSeconds: _durationNotifier.value,
      path: pathList,
      spots: _spots, // Include spots
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
      appBar: AppBar(title: const Text('산책')),
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
                      if (_initialPosition != null) {
                        controller.setLocationTrackingMode(
                          NLocationTrackingMode.follow,
                        );
                      }
                    },
                  ),
          ),
          Container(
            padding: const EdgeInsets.all(24),
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
                    minimumSize: const Size(double.infinity, 56),
                  ),
                  child: Text(
                    _isWalking ? '산책 종료' : '산책 시작',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
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
