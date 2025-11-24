import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'bridge_protocol.dart';
import '../services/location_service.dart';
import '../services/camera_service.dart';
import '../services/push_notification_service.dart';

/// JavaScript와 Flutter 간 통신을 담당하는 브릿지
class NativeBridge {
  final WebViewController webViewController;
  late final LocationService locationService;
  late final CameraService cameraService;
  late final PushNotificationService pushNotificationService;
  
  NativeBridge(this.webViewController) {
    locationService = LocationService();
    cameraService = CameraService();
    pushNotificationService = PushNotificationService();
    
    // Bridge 연결
    locationService.bridge = this;
    pushNotificationService.bridge = this;
  }
  
  /// React로 이벤트 전송
  Future<void> sendEventToReact(
    String eventType,
    Map<String, dynamic> data,
  ) async {
    final script = '''
      window.dispatchEvent(new CustomEvent('nativeEvent', {
        detail: {
          type: '$eventType',
          data: ${jsonEncode(data)}
        }
      }));
    ''';
    await webViewController.runJavaScript(script);
  }
  
  /// 메서드 호출 처리
  Future<dynamic> handleMethodCall(String method, Map<String, dynamic>? params) async {
    try {
      switch (method) {
        // 푸시 알림
        case BridgeProtocol.requestPushPermission:
          return await pushNotificationService.requestPermission();
          
        case BridgeProtocol.getPushToken:
          return await pushNotificationService.getToken();
          
        case BridgeProtocol.subscribeToTopic:
          if (params == null || params['topic'] == null) {
            throw Exception('Topic parameter is required');
          }
          await pushNotificationService.subscribeToTopic(params['topic'] as String);
          return {'success': true};
          
        // 위치
        case BridgeProtocol.requestLocationPermission:
          return await locationService.requestPermission();
          
        case BridgeProtocol.getCurrentLocation:
          return await locationService.getCurrentLocation();
          
        case BridgeProtocol.startLocationTracking:
          final interval = params?['interval'] as int? ?? 1000;
          await locationService.startTracking(interval: interval);
          return {'success': true};
          
        case BridgeProtocol.stopLocationTracking:
          await locationService.stopTracking();
          return {'success': true};
          
        // 카메라/사진
        case BridgeProtocol.requestCameraPermission:
          return await cameraService.requestCameraPermission();
          
        case BridgeProtocol.requestPhotoPermission:
          return await cameraService.requestPhotoPermission();
          
        case BridgeProtocol.openCamera:
          return await cameraService.pickImage(source: 'camera');
          
        case BridgeProtocol.openPhotoLibrary:
          return await cameraService.pickImage(source: 'gallery');
          
        case BridgeProtocol.pickImage:
          final source = params?['source'] as String? ?? 'gallery';
          return await cameraService.pickImage(source: source);
          
        // 앱 정보
        case BridgeProtocol.getAppVersion:
          return {'version': '0.1.0'};
          
        case BridgeProtocol.getDeviceInfo:
          return {
            'platform': 'mobile',
            'os': 'android/ios', // 실제로는 Platform.isAndroid 등으로 확인
          };
          
        default:
          throw PlatformException(
            code: 'METHOD_NOT_FOUND',
            message: 'Method $method not found',
          );
      }
    } catch (e) {
      throw PlatformException(
        code: 'METHOD_ERROR',
        message: e.toString(),
      );
    }
  }
}

