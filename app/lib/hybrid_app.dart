import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:goldpet_app/core/webview/hybrid_webview.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:goldpet_app/core/constants/app_constants.dart';
import 'package:goldpet_app/core/constants/keys.dart';
import 'package:goldpet_app/features/walk/screens/walk_screen.dart';
import 'package:goldpet_app/core/services/app_version_service.dart';
import 'package:goldpet_app/core/widgets/force_update_dialog.dart';

class HybridApp extends StatefulWidget {
  const HybridApp({super.key});

  @override
  State<HybridApp> createState() => _HybridAppState();
}

class _HybridAppState extends State<HybridApp> with WidgetsBindingObserver {
  static const _deepLinkChannel = MethodChannel('com.mannam.goldpet/deep_link');
  bool _isPushingWalkScreen = false;
  bool _versionCheckInProgress = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _setupDeepLinkListener();
    // 앱 시작 시 버전 체크 (첫 프레임 이후 BuildContext 사용 가능)
    WidgetsBinding.instance.addPostFrameCallback((_) => _checkAppVersion());
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _checkAppVersion();
    }
  }

  Future<void> _checkAppVersion() async {
    if (_versionCheckInProgress) return;
    if (!mounted) return;
    _versionCheckInProgress = true;
    try {
      final info = await AppVersionService.checkVersion();
      if (info == null || !mounted) return;

      if (info.forceUpdate) {
        await showForceUpdateDialog(
          context,
          updateUrl: info.updateUrl,
          updateMessage: info.updateMessage,
        );
      } else if (info.softUpdate) {
        final shouldShow = await AppVersionService.shouldShowSoftUpdate();
        if (shouldShow && mounted) {
          await showSoftUpdateDialog(
            context,
            updateUrl: info.updateUrl,
            updateMessage: info.updateMessage,
          );
        }
      }
    } finally {
      _versionCheckInProgress = false;
    }
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

    // Handle walk/stop deep link — stop the walk if in progress
    if (host == 'walk' && uri.pathSegments.isNotEmpty && uri.pathSegments.first == 'stop') {
      if (WalkScreen.isOnStack) {
        walkSpotActionController.add('STOP');
      }
      return;
    }

    if (host == 'walk' || host == 'spot') {
      if (_isPushingWalkScreen) return; // push in progress, ignore
      if (WalkScreen.isOnStack) {
        // WalkScreen already showing — deliver spot action via global stream
        if (spotAction != null) {
          walkSpotActionController.add(spotAction);
        }
      } else {
        // Push new WalkScreen
        _isPushingWalkScreen = true;
        rootNavigatorKey.currentState?.push(
          MaterialPageRoute(
            builder: (_) => WalkScreen(initialSpotAction: spotAction),
          ),
        ).then((_) {
          _isPushingWalkScreen = false;
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
