import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_naver_map/flutter_naver_map.dart';
import 'package:geolocator/geolocator.dart';

import '../../../core/theme/app_theme.dart';
import '../data/checkin_models.dart';
import '../providers/checkin_providers.dart';

class CheckInScreen extends ConsumerStatefulWidget {
  const CheckInScreen({super.key});

  @override
  ConsumerState<CheckInScreen> createState() => _CheckInScreenState();
}

class _CheckInScreenState extends ConsumerState<CheckInScreen> {
  NaverMapController? _mapController;
  NLatLng? _currentPosition;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initializeLocation();
  }

  Future<void> _initializeLocation() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        setState(() => _isLoading = false);
        return;
      }

      final position = await Geolocator.getCurrentPosition();
      setState(() {
        _currentPosition = NLatLng(position.latitude, position.longitude);
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _onMapReady(NaverMapController controller) {
    _mapController = controller;
    if (_currentPosition != null) {
      _mapController?.setLocationTrackingMode(NLocationTrackingMode.follow);
      // Fetch nearby places
      ref.invalidate(
        nearbyPlacesProvider(
          lat: _currentPosition!.latitude,
          lng: _currentPosition!.longitude,
        ),
      );
      ref
          .read(
            nearbyPlacesProvider(
              lat: _currentPosition!.latitude,
              lng: _currentPosition!.longitude,
            ).future,
          )
          .then((places) {
            _addMarkers(places);
          });
    }
  }

  void _addMarkers(List<PlaceResponse> places) {
    final markers = places.map((place) {
      return NMarker(
        id: place.id.toString(),
        position: NLatLng(place.latitude, place.longitude),
        caption: NOverlayCaption(text: place.name),
      )..setOnTapListener((overlay) {
        _showPlaceDetails(place);
        return true;
      });
    }).toSet();

    _mapController?.addOverlayAll(markers);
  }

  void _showPlaceDetails(PlaceResponse place) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        place.name,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        place.category.name,
                        style: const TextStyle(color: Colors.grey),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${place.checkinCount}회 방문',
                    style: const TextStyle(color: AppColors.primary),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (place.description != null) ...[
              Text(place.description!),
              const SizedBox(height: 16),
            ],
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  _showCheckInDialog(place);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text(
                  '여기 체크인하기',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  void _showCheckInDialog(PlaceResponse place) {
    final memoController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('${place.name} 체크인'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: memoController,
              decoration: const InputDecoration(
                labelText: '메모 (선택)',
                hintText: '오늘 산책은 어땠나요?',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            // Photo upload button could go here
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              await _performCheckIn(place.id, memoController.text);
            },
            child: const Text('확인'),
          ),
        ],
      ),
    );
  }

  Future<void> _performCheckIn(int placeId, String? memo) async {
    try {
      await ref
          .read(checkInControllerProvider.notifier)
          .checkIn(placeId: placeId, memo: memo);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('체크인 완료!')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('체크인 실패: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('장소 찾기'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _currentPosition == null
                ? null
                : () {
                    // Refresh logic
                    if (_currentPosition != null) {
                      ref.invalidate(
                        nearbyPlacesProvider(
                          lat: _currentPosition!.latitude,
                          lng: _currentPosition!.longitude,
                        ),
                      );
                    }
                  },
          ),
        ],
      ),
      body: _currentPosition == null
          ? const Center(child: Text('위치 정보를 불러올 수 없습니다.'))
          : NaverMap(
              options: NaverMapViewOptions(
                initialCameraPosition: NCameraPosition(
                  target: _currentPosition!,
                  zoom: 16,
                ),
                locationButtonEnable: true,
              ),
              onMapReady: _onMapReady,
            ),
    );
  }
}
