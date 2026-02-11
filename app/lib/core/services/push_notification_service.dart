import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../bridge/native_bridge.dart';
import '../config/environment.dart';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

/// Android 알림 채널
const AndroidNotificationChannel _androidChannel = AndroidNotificationChannel(
  'goldpet_notifications',
  'GoldPet 알림',
  description: 'GoldPet 앱 알림',
  importance: Importance.high,
);

/// 백그라운드 메시지 핸들러 (top-level function 필수)
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('[FCM] Background message: ${message.messageId}');
}

/// 푸시 알림 서비스
class PushNotificationService {
  NativeBridge? bridge;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  PushNotificationService();

  /// 초기화 (앱 시작 시 호출)
  Future<void> initialize() async {
    // 알림 채널 생성 (Android)
    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_androidChannel);

    // flutter_local_notifications 초기화
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );
    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );
    await _localNotifications.initialize(settings: initSettings);

    // 알림 권한 요청
    await requestPermission();

    // 리스너 설정
    _setupListeners();
  }

  void _setupListeners() {
    // 포그라운드 메시지 수신
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('[FCM] Foreground message: ${message.messageId}');
      debugPrint('[FCM] Data: ${message.data}');

      final notification = message.notification;
      if (notification != null) {
        debugPrint('[FCM] Notification: ${notification.title} - ${notification.body}');

        // 포그라운드에서 로컬 알림으로 표시
        _localNotifications.show(
          id: notification.hashCode,
          title: notification.title,
          body: notification.body,
          notificationDetails: NotificationDetails(
            android: AndroidNotificationDetails(
              _androidChannel.id,
              _androidChannel.name,
              channelDescription: _androidChannel.description,
              importance: Importance.high,
              priority: Priority.high,
              icon: '@mipmap/ic_launcher',
            ),
          ),
          payload: jsonEncode(message.data),
        );

        // React에도 이벤트 전달
        bridge?.sendEventToReact('pushNotificationReceived', {
          'title': notification.title,
          'body': notification.body,
          'data': message.data,
        });
      }
    });

    // 앱이 백그라운드에서 열릴 때 (알림 클릭 등)
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('[FCM] Notification opened app: ${message.messageId}');
      bridge?.sendEventToReact('pushNotificationClicked', {
        'title': message.notification?.title,
        'body': message.notification?.body,
        'data': message.data,
      });
    });
  }

  /// 푸시 알림 권한 요청
  Future<bool> requestPermission() async {
    final settings = await FirebaseMessaging.instance.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
    debugPrint('[FCM] Permission: ${settings.authorizationStatus}');
    return settings.authorizationStatus == AuthorizationStatus.authorized;
  }

  /// FCM 토큰 가져오기 (iOS에서는 APNs 토큰을 먼저 기다림)
  Future<String?> getToken() async {
    try {
      // iOS에서는 APNs 토큰이 준비될 때까지 대기
      if (Platform.isIOS) {
        String? apnsToken;
        for (int i = 0; i < 10; i++) {
          apnsToken = await FirebaseMessaging.instance.getAPNSToken();
          if (apnsToken != null) {
            debugPrint('[FCM] APNs token ready');
            break;
          }
          debugPrint('[FCM] Waiting for APNs token... (${i + 1}/10)');
          await Future.delayed(const Duration(seconds: 2));
        }
        if (apnsToken == null) {
          debugPrint('[FCM] APNs token not available after retries');
          return null;
        }
      }

      final token = await FirebaseMessaging.instance.getToken();
      debugPrint('[FCM] Token: $token');
      return token;
    } catch (e) {
      debugPrint('[FCM] Failed to get token: $e');
      return null;
    }
  }

  /// Register FCM token with backend
  Future<void> registerTokenWithBackend(String accessToken) async {
    try {
      final token = await getToken();
      if (token == null) {
        debugPrint('[FCM] Token is null, skipping registration');
        return;
      }

      await _sendTokenToBackend(token, accessToken);

      // Listen for token refresh
      FirebaseMessaging.instance.onTokenRefresh.listen((newToken) {
        debugPrint('[FCM] Token refreshed, re-registering...');
        _sendTokenToBackend(newToken, accessToken);
      });
    } catch (e) {
      debugPrint('[FCM] Failed to register token: $e');
    }
  }

  Future<void> _sendTokenToBackend(String fcmToken, String accessToken) async {
    try {
      final currentEnv = EnvironmentConfig.fromEnv();
      final uri = Uri.parse('${currentEnv.apiBaseUrl}/api/v1/users/me/fcm-token');
      final response = await http.put(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $accessToken',
        },
        body: jsonEncode({'fcmToken': fcmToken}),
      );

      if (response.statusCode == 200) {
        debugPrint('[FCM] Token registered with backend');
      } else {
        debugPrint('[FCM] Token registration failed: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('[FCM] Error sending token to backend: $e');
    }
  }

  /// 토픽 구독
  Future<void> subscribeToTopic(String topic) async {
    await FirebaseMessaging.instance.subscribeToTopic(topic);
  }
}
