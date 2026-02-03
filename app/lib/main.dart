import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:goldpet_app/hybrid_app.dart';
import 'package:flutter_naver_map/flutter_naver_map.dart';

import 'package:flutter_native_splash/flutter_native_splash.dart';

import 'package:firebase_core/firebase_core.dart';
import 'package:kakao_flutter_sdk_user/kakao_flutter_sdk_user.dart';

void main() async {
  WidgetsBinding widgetsBinding = WidgetsFlutterBinding.ensureInitialized();

  // Firebase 초기화
  await Firebase.initializeApp();

  // Kakao SDK 초기화
  // TODO: YOUR_KAKAO_APP_KEY를 실제 네이티브 앱 키로 변경해야 함
  KakaoSdk.init(nativeAppKey: '0d1faed93f83b48a4c1ce04f8583d345');
  
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
