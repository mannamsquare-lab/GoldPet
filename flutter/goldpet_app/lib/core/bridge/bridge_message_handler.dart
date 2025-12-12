import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'native_bridge.dart';

/// Bridge 메시지 라우팅 및 응답 처리
class BridgeMessageHandler {
  final WebViewController webViewController;
  final NativeBridge bridge;

  BridgeMessageHandler(this.webViewController, this.bridge);

  Future<void> setup() async {
    // React에서 호출하는 JavaScript Channel 등록
    await webViewController.addJavaScriptChannel(
      'NativeBridge',
      onMessageReceived: (JavaScriptMessage message) async {
        debugPrint('Bridge message received: ${message.message}');

        try {
          final data = jsonDecode(message.message) as Map<String, dynamic>;
          await _handleMessage(data);
        } catch (e) {
          print('Bridge message parse error: $e');
        }
      },
    );
  }

  Future<void> _handleMessage(Map<String, dynamic> data) async {
    final method = data['method'] as String?;
    final params = data['params'] as Map<String, dynamic>?;
    final id = data['id'] as String?;

    if (method == null || id == null) {
      print('Invalid bridge message: missing method or id');
      return;
    }

    try {
      final result = await bridge.handleMethodCall(method, params);
      await _sendResponse(id, true, result);
    } catch (e) {
      await _sendResponse(id, false, null, error: e.toString());
    }
  }

  Future<void> _sendResponse(
    String id,
    bool success,
    dynamic data, {
    String? error,
  }) async {
    final response = {
      'id': id,
      'success': success,
      'data': data,
      if (error != null) 'error': {'message': error},
      'timestamp': DateTime.now().millisecondsSinceEpoch,
    };

    final script =
        '''
      if (window.nativeBridge && window.nativeBridge.handleResponse) {
        window.nativeBridge.handleResponse(${jsonEncode(response)});
      }
    ''';

    try {
      await webViewController.runJavaScript(script);
    } catch (e) {
      print('Failed to send bridge response: $e');
    }
  }

  /// Bridge 스크립트 주입
  Future<void> injectBridgeScript() async {
    const script = '''
      (function() {
        // 이미 초기화되어 있고 handleResponse가 있다면 중복 초기화 방지
        if (window.nativeBridge && window.nativeBridge.handleResponse) {
          return;
        }
        
        window.nativeBridge = window.nativeBridge || {};
        
        // callMethod가 없으면 기본 구현 추가
        if (!window.nativeBridge.callMethod) {
          window.nativeBridge.callMethod = function(method, params) {
            return new Promise((resolve, reject) => {
              const id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
              
              window._bridgeCallbacks = window._bridgeCallbacks || {};
              window._bridgeCallbacks[id] = { resolve, reject };
              
              if (window.NativeBridge) {
                try {
                  window.NativeBridge.postMessage(JSON.stringify({
                    id: id,
                    method: method,
                    params: params || {},
                    timestamp: Date.now()
                  }));
                } catch (e) {
                  console.error('Error sending message: ' + e.message);
                  reject(e);
                  return;
                }
              } else {
                console.error('CRITICAL: window.NativeBridge is missing!');
                reject(new Error('NativeBridge channel not available'));
                return;
              }
              
              setTimeout(() => {
                if (window._bridgeCallbacks && window._bridgeCallbacks[id]) {
                  delete window._bridgeCallbacks[id];
                  reject(new Error('Bridge call timeout'));
                }
              }, 30000);
            });
          };
        }
        
        // handleResponse가 없으면 기본 구현 추가
        if (!window.nativeBridge.handleResponse) {
          window.nativeBridge.handleResponse = function(response) {
            const callback = window._bridgeCallbacks && window._bridgeCallbacks[response.id];
            if (callback) {
              delete window._bridgeCallbacks[response.id];
              if (response.success) {
                callback.resolve(response.data);
              } else {
                callback.reject(new Error(response.error?.message || 'Unknown error'));
              }
            }
          };
        }
      })();
    ''';

    await webViewController.runJavaScript(script);
  }
}
