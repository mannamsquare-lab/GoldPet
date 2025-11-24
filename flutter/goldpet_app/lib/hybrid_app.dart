
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kDebugMode;
import 'package:goldpet_app/core/webview/hybrid_webview.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';

class HybridApp extends StatefulWidget {
  const HybridApp({super.key});

  @override
  State<HybridApp> createState() => _HybridAppState();
}

class _HybridAppState extends State<HybridApp> {
  @override
  Widget build(BuildContext context) {
    // React 앱 URL
    // 개발 환경: Vite 개발 서버
    // 프로덕션: 로컬 파일 또는 CDN
    const reactAppUrl = kDebugMode
        ? 'http://192.168.0.149:5173'  // 개발 서버 (로컬 IP)
        : 'assets/web/index.html'; // 프로덕션 빌드
    
    return MaterialApp(
      title: 'GoldPet',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.brown,
        useMaterial3: true,
      ),
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
