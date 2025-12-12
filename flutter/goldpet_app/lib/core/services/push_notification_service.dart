import 'dart:async';
import 'package:flutter/foundation.dart';
import '../bridge/native_bridge.dart';

import 'package:firebase_messaging/firebase_messaging.dart';

/// 푸시 알림 서비스
class PushNotificationService {
  NativeBridge? bridge;

  PushNotificationService() {
    _setupListeners();
  }

  void _setupListeners() {
    // 포그라운드 메시지 수신
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('Got a message whilst in the foreground!');
      debugPrint('Message data: ${message.data}');

      if (message.notification != null) {
        debugPrint(
          'Message also contained a notification: ${message.notification}',
        );

        bridge?.sendEventToReact('pushNotificationReceived', {
          'title': message.notification?.title,
          'body': message.notification?.body,
          'data': message.data,
        });
      }
    });

    // 앱이 백그라운드에서 열릴 때 (알림 클릭 등)
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('A new onMessageOpenedApp event was published!');
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
    debugPrint('User granted permission: ${settings.authorizationStatus}');
    return settings.authorizationStatus == AuthorizationStatus.authorized;
  }

  /// FCM 토큰 가져오기
  Future<String?> getToken() async {
    try {
      final token = await FirebaseMessaging.instance.getToken();
      debugPrint('FCM Token: $token');
      return token;
    } catch (e) {
      debugPrint('Failed to get FCM token: $e');
      return null;
    }
  }

  /// 토픽 구독
  Future<void> subscribeToTopic(String topic) async {
    await FirebaseMessaging.instance.subscribeToTopic(topic);
  }
}
