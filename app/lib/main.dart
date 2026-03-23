import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:goldpet_app/hybrid_app.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:kakao_flutter_sdk_user/kakao_flutter_sdk_user.dart';
import 'package:goldpet_app/core/services/push_notification_service.dart';

void main() async {
  WidgetsBinding widgetsBinding = WidgetsFlutterBinding.ensureInitialized();

  // Set system UI overlay style (status bar and navigation bar)
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Color(0xFFEFE1C4),
    statusBarIconBrightness: Brightness.dark,
    systemNavigationBarColor: Color(0xFFEFE1C4),
    systemNavigationBarIconBrightness: Brightness.dark,
  ));

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

  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);

  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
    // TODO: Send to Crashlytics when integrated
    debugPrint('FlutterError: ${details.exception}');
  };

  runZonedGuarded(() {
    runApp(const ProviderScope(child: MainApp()));
  }, (error, stackTrace) {
    // TODO: Send to Crashlytics when integrated
    debugPrint('Uncaught error: $error');
    debugPrint('Stack trace: $stackTrace');
  });
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const HybridApp();
  }
}
