import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:goldpet_app/core/webview/hybrid_webview.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:goldpet_app/core/constants/app_constants.dart';
import 'package:goldpet_app/core/constants/keys.dart';
import 'package:goldpet_app/features/walk/screens/walk_screen.dart';

class HybridApp extends StatefulWidget {
  const HybridApp({super.key});

  @override
  State<HybridApp> createState() => _HybridAppState();
}

class _HybridAppState extends State<HybridApp> {
  static const _deepLinkChannel = MethodChannel('com.mannam.goldpet/deep_link');
  bool _walkScreenActive = false;

  @override
  void initState() {
    super.initState();
    _setupDeepLinkListener();
  }

  Future<void> _setupDeepLinkListener() async {
    // Push handler: warm/hot restart deep links
    _deepLinkChannel.setMethodCallHandler((call) async {
      if (call.method == 'onDeepLink') {
        final uri = call.arguments as String?;
        if (uri != null) _handleDeepLink(uri);
      }
    });

    // Pull handler: cold start deep link (buffered on native side)
    try {
      final initialLink = await _deepLinkChannel.invokeMethod<String>('getInitialLink');
      if (initialLink != null) {
        // Slight delay to ensure navigation is ready
        await Future.delayed(const Duration(milliseconds: 500));
        _handleDeepLink(initialLink);
      }
    } catch (_) {
      // Channel not ready or no initial link — ignore
    }
  }

  void _handleDeepLink(String uriString) {
    final uri = Uri.tryParse(uriString);
    if (uri == null || uri.scheme != 'goldpet') return;

    final host = uri.host;
    String? spotAction;

    if (host == 'spot' && uri.pathSegments.isNotEmpty) {
      spotAction = uri.pathSegments.first.toUpperCase(); // pee → PEE
    }

    if (host == 'walk' || host == 'spot') {
      if (_walkScreenActive) {
        // WalkScreen already showing — deliver spot action via global stream
        if (spotAction != null) {
          walkSpotActionController.add(spotAction);
        }
      } else {
        // Push new WalkScreen
        _walkScreenActive = true;
        rootNavigatorKey.currentState?.push(
          MaterialPageRoute(
            builder: (_) => WalkScreen(initialSpotAction: spotAction),
          ),
        ).then((_) {
          _walkScreenActive = false;
        });
      }
    }
  }

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
