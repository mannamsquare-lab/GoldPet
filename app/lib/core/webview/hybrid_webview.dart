import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:webview_flutter_wkwebview/webview_flutter_wkwebview.dart';
import 'package:webview_flutter_platform_interface/webview_flutter_platform_interface.dart';
import 'package:image_picker/image_picker.dart';
import '../bridge/bridge_message_handler.dart';
import '../bridge/native_bridge.dart';
import '../services/location_service.dart';
import '../widgets/goldpet_alert_dialog.dart';
import 'dart:io';
import 'package:url_launcher/url_launcher.dart';

/// React 앱을 로드하는 WebView 래퍼
class HybridWebView extends StatefulWidget {
  final String initialUrl;
  final VoidCallback? onAppLoaded;

  const HybridWebView({super.key, required this.initialUrl, this.onAppLoaded});

  @override
  State<HybridWebView> createState() => _HybridWebViewState();
}

class _HybridWebViewState extends State<HybridWebView> {
  late final WebViewController _controller;
  late final LocationService _locationService;
  late final NativeBridge _bridge;
  late final BridgeMessageHandler _bridgeController;
  Color _scaffoldColor = const Color(0xFFEFE1C4);
  Color _bottomSafeAreaColor = const Color(0xFFEFE1C4);
  Color? _overlayColor;
  Color? _bottomOverlayColor;
  DateTime? _lastBackPressTime;

  @override
  void initState() {
    super.initState();
    // Edge-to-edge 모드: 시스템 네비게이션 바를 투명하게 하여 앱 콘텐츠 위에 오버레이
    // 이렇게 하면 네비게이션 바 경계선(divider)이 사라짐
    if (Platform.isAndroid) {
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    }
    _initializeWebView();
  }

  Future<void> _initializeWebView() async {
    // Google Login 403 에러 방지를 위한 User Agent 설정
    // "wv" 또는 "Version/4.0" 등의 식별자를 제거하여 일반 브라우저처럼 보이게 함
    final String userAgent = Platform.isIOS
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36';

    // WebView 컨트롤러 생성
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setUserAgent(userAgent)
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
            // URL 변경 감지를 위한 JS 주입 (SPA pushState/popstate 모니터링)
            _injectUrlChangeMonitor();
            // 현재 URL 기반으로 시스템 바 컬러 업데이트
            _updateSystemBarColors(url);
          },
          onWebResourceError: (WebResourceError error) {
            debugPrint('WebView error: ${error.description}');
          },
          onNavigationRequest: (NavigationRequest request) async {
            final url = request.url;
            debugPrint('NavigationRequest: $url'); // 디버깅 로그 추가
            final uri = Uri.parse(url);

            // 1. Android Intent URL 처리
            if (Platform.isAndroid && url.startsWith('intent://')) {
              debugPrint('Detected Intent URL: $url');
              try {
                await launchUrl(uri, mode: LaunchMode.externalApplication);
                return NavigationDecision.prevent;
              } catch (e) {
                debugPrint('Failed to launch Intent: $e');
                // 앱이 설치되어 있지 않은 경우 fallback URL 처리
                final fallbackUrl = _extractFallbackUrl(url);
                if (fallbackUrl != null) {
                  debugPrint('Launching Fallback URL: $fallbackUrl');
                  await launchUrl(
                    Uri.parse(fallbackUrl),
                    mode: LaunchMode.externalApplication,
                  );
                }
                return NavigationDecision.prevent;
              }
            }

            // 2. Custom Schemes (Kakao, Naver, etc.) 처리
            // http/https가 아닌 경우 외부 앱 실행 시도
            if (uri.scheme != 'http' && uri.scheme != 'https') {
              debugPrint('Detected Custom Scheme: ${uri.scheme}');
              try {
                if (await canLaunchUrl(uri)) {
                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                  return NavigationDecision.prevent;
                } else {
                  debugPrint('Cannot launch URL: $url');
                }
              } catch (e) {
                debugPrint('Failed to launch Custom Scheme: $e');
              }
              // 처리할 수 없는 스킴이라도 WebView에서 로드하지 않도록 차단 (보안/오류 방지)
              return NavigationDecision.prevent;
            }

            // 3. HTTP/HTTPS는 WebView에서 로드
            // 단, 특정 도메인(예: App Link)은 예외 처리가 필요할 수 있음
            return NavigationDecision.navigate;
          },
        ),
      )
      ..setOnJavaScriptAlertDialog((
        JavaScriptAlertDialogRequest request,
      ) async {
        await showGoldPetAlert(
          context,
          message: request.message,
          confirmText: '확인',
        );
      })
      ..setOnConsoleMessage((JavaScriptConsoleMessage message) {
        debugPrint('JS Console: ${message.message}');
      });

    // Enable WebView debugging in debug mode
    if (_controller.platform is AndroidWebViewController) {
      AndroidWebViewController.enableDebugging(true);
    }

    // iOS: 왼→오 스와이프 백 제스처로 WebView 히스토리 네비게이션 활성화
    if (_controller.platform is WebKitWebViewController) {
      final wkController = _controller.platform as WebKitWebViewController;
      await wkController.setAllowsBackForwardNavigationGestures(true);
    }

    // Android file upload support via content:// URIs
    if (_controller.platform is AndroidWebViewController) {
      final androidController = _controller.platform as AndroidWebViewController;
      await androidController.setOnShowFileSelector((params) async {
        final ImagePicker picker = ImagePicker();

        if (params.acceptTypes.any((type) => type.contains('image'))) {
          // Show bottom sheet to choose camera or gallery
          final source = await showModalBottomSheet<String>(
            context: context,
            builder: (BuildContext ctx) {
              return SafeArea(
                child: Wrap(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.camera_alt),
                      title: const Text('카메라로 촬영'),
                      onTap: () => Navigator.pop(ctx, 'camera'),
                    ),
                    ListTile(
                      leading: const Icon(Icons.photo_library),
                      title: const Text('갤러리에서 선택'),
                      onTap: () => Navigator.pop(ctx, 'gallery'),
                    ),
                  ],
                ),
              );
            },
          );

          if (source == null) return [];

          if (source == 'camera') {
            final XFile? photo = await picker.pickImage(
              source: ImageSource.camera,
              imageQuality: 80,
              maxWidth: 1920,
              maxHeight: 1920,
            );
            if (photo == null) return [];
            final contentUri = await _getContentUri(photo.path);
            if (contentUri == null) return [];
            return [contentUri];
          } else {
            final List<XFile> images = await picker.pickMultiImage(
              imageQuality: 80,
              maxWidth: 1920,
              maxHeight: 1920,
            );
            if (images.isEmpty) return [];
            final uris = <String>[];
            for (final image in images) {
              final contentUri = await _getContentUri(image.path);
              if (contentUri != null) {
                uris.add(contentUri);
              }
            }
            return uris;
          }
        } else {
          final XFile? file = await picker.pickImage(source: ImageSource.gallery);
          if (file == null) return [];
          final contentUri = await _getContentUri(file.path);
          if (contentUri == null) return [];
          return [contentUri];
        }
      });
    }

    // URL 변경 감지 채널 등록 (SPA 라우트 변경 시 시스템 바 컬러 업데이트)
    await _controller.addJavaScriptChannel(
      'UrlChangeChannel',
      onMessageReceived: (JavaScriptMessage message) {
        _updateSystemBarColors(message.message);
      },
    );

    // Bridge 초기화 (서비스는 Bridge 내부에서 생성됨)
    _bridge = NativeBridge(_controller);

    // 오버레이 색상 제어 콜백 연결
    _bridge.onOverlayColorChange = (color, bottomColor) {
      if (!mounted) return;
      setState(() {
        _overlayColor = color;
        _bottomOverlayColor = bottomColor;
      });
      // 오버레이 상태에 따라 StatusBar/NavigationBar 아이콘 밝기 변경
      final effectiveBottomColor = bottomColor ?? _bottomSafeAreaColor;
      final isBottomDark = bottomColor != null && bottomColor.computeLuminance() < 0.5;
      SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
        statusBarColor: color ?? _scaffoldColor,
        statusBarIconBrightness: color != null ? Brightness.light : Brightness.dark,
        systemNavigationBarColor: Platform.isAndroid ? const Color(0x00000000) : effectiveBottomColor,
        systemNavigationBarDividerColor: Platform.isAndroid ? const Color(0x00000000) : effectiveBottomColor,
        systemNavigationBarContrastEnforced: false,
        systemNavigationBarIconBrightness: isBottomDark ? Brightness.light : Brightness.dark,
      ));
    };

    // 서비스 참조 가져오기
    _locationService = _bridge.locationService;

    // Bridge Controller 초기화 (JavaScript Channel 등록)
    _bridgeController = BridgeMessageHandler(_controller, _bridge);
    await _bridgeController.setup();

    // 마지막으로 페이지 로드
    _controller.loadRequest(Uri.parse(widget.initialUrl));

    // 화면 갱신을 위해 setState 호출 (필요한 경우)
    if (mounted) {
      setState(() {});
    }
  }

  String? _extractFallbackUrl(String intentUrl) {
    try {
      final parts = intentUrl.split(';');
      for (final part in parts) {
        if (part.startsWith('S.browser_fallback_url=')) {
          return Uri.decodeFull(
            part.substring('S.browser_fallback_url='.length),
          );
        }
      }
    } catch (e) {
      debugPrint('Failed to extract fallback URL: $e');
    }
    return null;
  }

  static const _fileProviderChannel = MethodChannel('com.mannam.goldpet/file_provider');

  Future<String?> _getContentUri(String filePath) async {
    try {
      if (Platform.isAndroid) {
        final String? contentUri = await _fileProviderChannel.invokeMethod(
            'getContentUri', {'filePath': filePath});
        debugPrint('Converted to content URI: $contentUri');
        return contentUri;
      }
      return Uri.file(filePath).toString();
    } catch (e) {
      debugPrint('Failed to get content URI: $e');
      return null;
    }
  }

  /// SPA 라우트 변경 감지를 위한 JS 주입
  /// pushState/replaceState를 패치하고 popstate를 리스닝
  Future<void> _injectUrlChangeMonitor() async {
    const script = '''
      (function() {
        if (window._urlChangeMonitorInstalled) return;
        window._urlChangeMonitorInstalled = true;

        var notify = function() {
          if (window.UrlChangeChannel) {
            window.UrlChangeChannel.postMessage(window.location.href);
          }
        };

        var origPushState = history.pushState;
        history.pushState = function() {
          origPushState.apply(this, arguments);
          notify();
        };

        var origReplaceState = history.replaceState;
        history.replaceState = function() {
          origReplaceState.apply(this, arguments);
          notify();
        };

        window.addEventListener('popstate', notify);
      })();
    ''';
    try {
      await _controller.runJavaScript(script);
    } catch (e) {
      debugPrint('Failed to inject URL change monitor: $e');
    }
  }

  // TypeBLayout 라우트 (헤더/하단네비 컬러가 #EFE1C4인 페이지들)
  // community, chat은 리스트만 TypeB, 상세/작성 페이지는 TypeA
  static const _typeBExactRoutes = ['/home', '/friend-find', '/friend-list', '/chat', '/walk', '/community', '/places', '/gold'];
  static const _typeBPrefixRoutes = ['/walk/', '/places/', '/gold/'];
  static const Color _colorEFE1C4 = Color(0xFFEFE1C4);
  static const Color _colorFFF7E6 = Color(0xFFFFF7E6);
  static const Color _colorF9ECD2 = Color(0xFFF9ECD2);

  /// URL 경로에 따라 시스템 바 컬러 + Scaffold 배경색 업데이트
  void _updateSystemBarColors(String? url) {
    if (url == null) return;
    final uri = Uri.tryParse(url);
    if (uri == null) return;
    final path = uri.path;

    // 라우트 변경 시 오버레이 색상 초기화 (safety net)
    if (_overlayColor != null) {
      setState(() { _overlayColor = null; _bottomOverlayColor = null; });
      SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
        statusBarColor: _scaffoldColor,
        statusBarIconBrightness: Brightness.dark,
        systemNavigationBarColor: Platform.isAndroid ? const Color(0x00000000) : _bottomSafeAreaColor,
        systemNavigationBarDividerColor: Platform.isAndroid ? const Color(0x00000000) : _bottomSafeAreaColor,
        systemNavigationBarContrastEnforced: false,
        systemNavigationBarIconBrightness: Brightness.dark,
      ));
    }

    bool isTypeB = false;

    // Exact match (main tab pages only)
    if (_typeBExactRoutes.contains(path)) {
      isTypeB = true;
    }
    // Prefix match - sub-pages within TypeBLayout (/walk/*, /places/*, /gold/*)
    else if (_typeBPrefixRoutes.any((p) => path.startsWith(p))) {
      isTypeB = true;
    }

    final color = isTypeB ? _colorEFE1C4 : _colorFFF7E6;

    // 하단 입력창이 있는 페이지: 입력창 배경색(#F9ECD2)에 맞춰 네비게이션 바 색상 변경
    final isCommunityDetail = path.startsWith('/community/') && path != '/community/write';
    final isChatDetail = path.startsWith('/chat/') && path != '/chat';
    final hasBottomInput = isCommunityDetail || isChatDetail;
    final navBarColor = hasBottomInput ? _colorEFE1C4 : color;

    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      statusBarColor: color,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Platform.isAndroid ? const Color(0x00000000) : navBarColor,
      systemNavigationBarDividerColor: Platform.isAndroid ? const Color(0x00000000) : navBarColor,
      systemNavigationBarContrastEnforced: false,
      systemNavigationBarIconBrightness: Brightness.dark,
    ));

    final needsUpdate = _scaffoldColor != color || _bottomSafeAreaColor != navBarColor;
    if (needsUpdate) {
      setState(() {
        _scaffoldColor = color;
        _bottomSafeAreaColor = navBarColor;
      });
    }
  }

  /// Android 뒤로가기 버튼 처리: WebView 히스토리 → 더블탭 종료
  Future<void> _handleBackNavigation() async {
    if (await _controller.canGoBack()) {
      await _controller.goBack();
      return;
    }
    final now = DateTime.now();
    if (_lastBackPressTime != null &&
        now.difference(_lastBackPressTime!) < const Duration(seconds: 2)) {
      SystemNavigator.pop();
      return;
    }
    _lastBackPressTime = now;
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('한 번 더 누르면 종료합니다'),
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  @override
  void dispose() {
    _locationService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) return;
        if (!Platform.isAndroid) return;
        _handleBackNavigation();
      },
      child: Scaffold(
        backgroundColor: _overlayColor ?? _scaffoldColor,
        body: SafeArea(
          bottom: false,
          child: ColoredBox(
            color: _bottomOverlayColor ?? _bottomSafeAreaColor,
            child: Padding(
              padding: EdgeInsets.only(bottom: bottomPadding),
              child: Platform.isAndroid
                  ? WebViewWidget.fromPlatformCreationParams(
                      params: AndroidWebViewWidgetCreationParams.fromPlatformWebViewWidgetCreationParams(
                        PlatformWebViewWidgetCreationParams(
                          controller: _controller.platform,
                          layoutDirection: TextDirection.ltr,
                        ),
                        displayWithHybridComposition: true,
                      ),
                    )
                  : WebViewWidget(controller: _controller),
            ),
          ),
        ),
      ),
    );
  }
}
