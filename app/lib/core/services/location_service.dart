import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import '../bridge/native_bridge.dart';

/// 위치 서비스
class LocationService {
  NativeBridge? bridge;
  StreamSubscription<Position>? _positionStream;
  
  LocationService();
  
  /// 위치 권한 요청
  Future<Map<String, dynamic>> requestPermission() async {
    final status = await Permission.location.request();
    return {
      'granted': status.isGranted,
      'status': status.toString(),
    };
  }
  
  /// 현재 위치 가져오기
  Future<Map<String, dynamic>> getCurrentLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception('Location services are disabled');
    }
    
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception('Location permissions are denied');
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      throw Exception('Location permissions are permanently denied');
    }
    
    final position = await Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
    );
    
    return {
      'latitude': position.latitude,
      'longitude': position.longitude,
      'accuracy': position.accuracy,
      'altitude': position.altitude,
      'speed': position.speed,
      'timestamp': position.timestamp.millisecondsSinceEpoch,
    };
  }
  
  /// 위치 추적 시작
  Future<void> startTracking({int interval = 1000}) async {
    if (_positionStream != null) {
      return; // 이미 추적 중
    }
    
    _positionStream = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10, // 10m 이상 이동 시 업데이트
      ),
    ).listen((position) {
      bridge?.sendEventToReact('locationUpdated', {
        'latitude': position.latitude,
        'longitude': position.longitude,
        'accuracy': position.accuracy,
        'altitude': position.altitude,
        'speed': position.speed,
        'timestamp': position.timestamp.millisecondsSinceEpoch,
      });
    });
  }
  
  /// 위치 추적 중지
  Future<void> stopTracking() async {
    await _positionStream?.cancel();
    _positionStream = null;
  }
  
  void dispose() {
    stopTracking();
  }
}

