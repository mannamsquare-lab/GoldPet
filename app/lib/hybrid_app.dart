import 'package:flutter/material.dart';
import 'package:goldpet_app/core/webview/hybrid_webview.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:goldpet_app/core/constants/app_constants.dart';
import 'package:goldpet_app/core/constants/keys.dart';

class HybridApp extends StatefulWidget {
  const HybridApp({super.key});

  @override
  State<HybridApp> createState() => _HybridAppState();
}

class _HybridAppState extends State<HybridApp> {
  @override
  Widget build(BuildContext context) {
    // React 앱 URL - 환경 설정에 따라 결정
    final reactAppUrl = currentEnv.appBaseUrl;

    return MaterialApp(
      navigatorKey: rootNavigatorKey,
      title: 'GoldPet',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.brown, useMaterial3: true),
      home: HybridWebView(
        initialUrl: reactAppUrl,
        onAppLoaded: () {
          // WebView 로딩이 완료되면 스플래시 화면 제거
          FlutterNativeSplash.remove();
        },
      ),
    );
  }
}
