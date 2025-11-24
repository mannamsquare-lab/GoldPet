import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../bridge/bridge_message_handler.dart';
import '../bridge/native_bridge.dart';
import '../services/location_service.dart';

/// React 앱을 로드하는 WebView 래퍼
class HybridWebView extends StatefulWidget {
  final String initialUrl;
  final VoidCallback? onAppLoaded;
  
  const HybridWebView({
    super.key,
    required this.initialUrl,
    this.onAppLoaded,
  });
  
  @override
  State<HybridWebView> createState() => _HybridWebViewState();
}

class _HybridWebViewState extends State<HybridWebView> {
  late final WebViewController _controller;
  late final LocationService _locationService;
  late final NativeBridge _bridge;
  late final BridgeMessageHandler _bridgeController;
  
  @override
  void initState() {
    super.initState();
    _initializeWebView();
  }
  
  void _initializeWebView() {
    // WebView 컨트롤러 생성
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            debugPrint('Page started loading: $url');
          },
          onPageFinished: (String url) {
            debugPrint('Page finished loading: $url');
            widget.onAppLoaded?.call();
            // 페이지 로딩 완료 시 브릿지 초기화
            _bridgeController.injectBridgeScript();
          },
          onWebResourceError: (WebResourceError error) {
            debugPrint('WebView error: ${error.description}');
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.initialUrl));
    
    // Bridge 초기화 (서비스는 Bridge 내부에서 생성됨)
    _bridge = NativeBridge(_controller);
    
    // 서비스 참조 가져오기
    _locationService = _bridge.locationService;
    
    // Bridge Controller 초기화
    _bridgeController = BridgeMessageHandler(_controller, _bridge);
  }
  
  @override
  void dispose() {
    _locationService.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return WebViewWidget(controller: _controller);
  }
}

