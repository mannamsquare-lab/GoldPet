import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:goldpet_app/hybrid_app.dart';
import 'package:flutter_naver_map/flutter_naver_map.dart';

import 'package:flutter_native_splash/flutter_native_splash.dart';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:kakao_flutter_sdk_user/kakao_flutter_sdk_user.dart';
import 'package:goldpet_app/core/services/push_notification_service.dart';

void main() async {
  WidgetsBinding widgetsBinding = WidgetsFlutterBinding.ensureInitialized();

  // Firebase 초기화
  await Firebase.initializeApp();

  // FCM 백그라운드 메시지 핸들러 등록
  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

  // 푸시 알림 서비스 초기화 (권한 요청 + 알림 채널 생성)
  final pushService = PushNotificationService();
  await pushService.initialize();

  // Kakao SDK 초기화
  KakaoSdk.init(
    nativeAppKey: const String.fromEnvironment(
      'KAKAO_APP_KEY',
      defaultValue: '0d1faed93f83b48a4c1ce04f8583d345',
    ),
  );

  // Naver Map SDK 초기화
  await NaverMapSdk.instance.initialize(clientId: 'ex0an0bs06');

  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);
  runApp(const ProviderScope(child: MainApp()));
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const HybridApp();
  }
}
