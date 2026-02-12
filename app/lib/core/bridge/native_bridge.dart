import 'dart:convert';
import 'dart:io';
import 'package:flutter/services.dart';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:flutter_file_dialog/flutter_file_dialog.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'bridge_protocol.dart';
import '../services/location_service.dart';
import '../services/camera_service.dart';
import '../services/push_notification_service.dart';
import '../../services/native_auth_service.dart';
import '../constants/keys.dart';
import '../api/api_client.dart';
import '../../features/walk/screens/walk_screen.dart';

/// JavaScript와 Flutter 간 통신을 담당하는 브릿지
class NativeBridge {
  final WebViewController webViewController;
  late final LocationService locationService;
  late final CameraService cameraService;
  late final PushNotificationService pushNotificationService;
  late final NativeAuthService nativeAuthService;

  NativeBridge(this.webViewController) {
    locationService = LocationService();
    cameraService = CameraService();
    pushNotificationService = PushNotificationService();
    nativeAuthService = NativeAuthService();

    // Bridge 연결
    locationService.bridge = this;
    pushNotificationService.bridge = this;
  }

  /// React로 이벤트 전송
  void sendEventToReact(String eventName, Map<String, dynamic> data) {
    final message = jsonEncode({'type': eventName, 'data': data});
    webViewController.runJavaScript("window.postMessage($message, '*')");
  }

  /// 메서드 호출 처리
  Future<dynamic> handleMethodCall(
    String method,
    Map<String, dynamic>? params,
  ) async {
    try {
      switch (method) {
        // 로그인
        case 'login':
          final provider = params?['provider'] as String?;
          String? token;
          Map<String, dynamic>? backendResult;

          if (provider == 'kakao') {
            token = await nativeAuthService.loginWithKakao();
          } else if (provider == 'naver') {
            token = await nativeAuthService.loginWithNaver();
          } else if (provider == 'google') {
            token = await nativeAuthService.loginWithGoogle();
          } else if (provider == 'apple') {
            token = await nativeAuthService.loginWithApple();
          }

          if (token != null && provider != null) {
            backendResult = await nativeAuthService.verifyTokenWithBackend(
              provider,
              token,
            );
          }

          if (backendResult != null) {
            final newResult = Map<String, dynamic>.from(backendResult);
            // Frontend expects 'token' and 'type'
            newResult['token'] = newResult['accessToken'];

            // Store tokens in Flutter secure storage for native API calls (e.g. walk save)
            final accessToken = newResult['accessToken'] as String?;
            final refreshToken = newResult['refreshToken'] as String?;
            if (accessToken != null && refreshToken != null) {
              await ApiClient().setToken(accessToken, refreshToken);
            }

            // Determine type based on response content
            // If backend returns 'user', we need to check if it's a complete user or a new incomplete user
            // The user said: "2. If not in DB, save to DB -> 2-1. Move to Terms"
            // So even if we have a user, if they lack required info (like phoneNumber), it's a signup flow.
            if (newResult.containsKey('user')) {
              final user = newResult['user'] as Map<String, dynamic>;
              // Check if essential fields are present.
              // Based on Sign-UP_Join.md, additional info includes: name, birthDate, gender, phoneNumber.
              // We'll check phoneNumber as a strong indicator of a completed signup.
              final hasPhoneNumber =
                  user['phoneNumber'] != null &&
                  (user['phoneNumber'] as String).isNotEmpty;

              if (hasPhoneNumber) {
                newResult['type'] = 'LOGIN_SUCCESS';
              } else {
                newResult['type'] = 'SIGNUP_REQUIRED';
                newResult['provider'] = provider;
              }
            } else {
              // Should not happen if backend always returns user on save, but fallback to signup
              newResult['type'] = 'SIGNUP_REQUIRED';
              newResult['provider'] = provider;
            }
            return newResult;
          }

          return {'success': false, 'message': 'Login failed'};

        // Auth 토큰 동기화 (React → Flutter secure storage)
        case 'syncAuthToken':
          final accessToken = params?['accessToken'] as String?;
          final refreshToken = params?['refreshToken'] as String?;
          if (accessToken != null) {
            await ApiClient().setToken(accessToken, refreshToken ?? '');
            debugPrint('[NativeBridge] Auth tokens synced to secure storage');
          }
          return {'success': true};

        // FCM 토큰 등록
        case 'registerFcmToken':
          final accessToken = params?['accessToken'] as String?;
          if (accessToken != null) {
            pushNotificationService.registerTokenWithBackend(accessToken);
          }
          return {'success': true};

        // 푸시 알림
        case BridgeProtocol.requestPushPermission:
          return await pushNotificationService.requestPermission();

        case BridgeProtocol.getPushToken:
          return await pushNotificationService.getToken();

        case BridgeProtocol.subscribeToTopic:
          if (params == null || params['topic'] == null) {
            throw Exception('Topic parameter is required');
          }
          await pushNotificationService.subscribeToTopic(
            params['topic'] as String,
          );
          return {'success': true};

        // 위치
        case BridgeProtocol.requestLocationPermission:
          return await locationService.requestPermission();

        case BridgeProtocol.getCurrentLocation:
          return await locationService.getCurrentLocation();

        case BridgeProtocol.startLocationTracking:
          final interval = params?['interval'] as int? ?? 1000;
          await locationService.startTracking(interval: interval);
          return {'success': true};

        case BridgeProtocol.stopLocationTracking:
          await locationService.stopTracking();
          return {'success': true};

        // 카메라/사진
        case BridgeProtocol.requestCameraPermission:
          return await cameraService.requestCameraPermission();

        case BridgeProtocol.requestPhotoPermission:
          return await cameraService.requestPhotoPermission();

        case BridgeProtocol.openCamera:
          return await cameraService.pickImage(source: 'camera');

        case BridgeProtocol.openPhotoLibrary:
          return await cameraService.pickImage(source: 'gallery');

        case BridgeProtocol.pickImage:
          final source = params?['source'] as String? ?? 'gallery';
          return await cameraService.pickImage(source: source);

        // 앱 정보
        // 앱 정보
        case BridgeProtocol.getAppVersion:
          return {'version': '0.1.0'};

        case BridgeProtocol.getDeviceInfo:
          return {
            'platform': 'mobile',
            'os': 'android/ios', // 실제로는 Platform.isAndroid 등으로 확인
          };

        // 파일 다운로드
        case 'downloadFile':
          final url = params?['url'] as String?;
          final fileName = params?['fileName'] as String? ?? url?.split('/').last ?? 'download';
          if (url == null) throw Exception('URL parameter is required');

          try {
            final tempDir = await getTemporaryDirectory();
            final tempPath = '${tempDir.path}/$fileName';
            await Dio().download(url, tempPath);
            debugPrint('[Bridge] File downloaded to: $tempPath');

            if (Platform.isAndroid) {
              // Android: Downloads 폴더에 복사
              final downloadsDir = Directory('/storage/emulated/0/Download');
              if (await downloadsDir.exists()) {
                final destPath = '${downloadsDir.path}/$fileName';
                await File(tempPath).copy(destPath);
                debugPrint('[Bridge] File saved to Downloads: $destPath');

                sendEventToReact('fileDownloaded', {
                  'fileName': fileName,
                  'path': destPath,
                  'message': '다운로드 폴더에 저장되었습니다',
                });
                return {'success': true, 'path': destPath};
              }
            }

            // iOS: 네이티브 저장 다이얼로그
            if (Platform.isIOS) {
              final savedPath = await FlutterFileDialog.saveFile(
                params: SaveFileDialogParams(sourceFilePath: tempPath),
              );
              if (savedPath != null) {
                sendEventToReact('fileDownloaded', {
                  'fileName': fileName,
                  'path': savedPath,
                  'message': '파일이 저장되었습니다',
                });
              }
              return {'success': true, 'path': savedPath ?? tempPath};
            }

            // Fallback: 공유 시트
            await SharePlus.instance.share(
              ShareParams(files: [XFile(tempPath)]),
            );
            return {'success': true, 'path': tempPath};
          } catch (e) {
            debugPrint('[Bridge] Download failed: $e');
            await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
            return {'success': true, 'fallback': true};
          }

        // 외부 URL 열기
        case 'openExternalUrl':
          final url = params?['url'] as String?;
          if (url != null) {
            await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
            return {'success': true};
          }
          throw Exception('URL parameter is required');

        // 산책 (Walk Feature)
        case 'startWalk':
          // Don't await - return immediately so bridge doesn't timeout
          rootNavigatorKey.currentState?.push(
            MaterialPageRoute(builder: (_) => const WalkScreen()),
          );
          return {'success': true};

        // 현재 채팅방 설정 (푸시 알림 필터링용)
        case 'setCurrentChatRoom':
          final chatRoomId = params?['chatRoomId'] as String?;
          pushNotificationService.setCurrentChatRoom(chatRoomId);
          return {'success': true};

        default:
          throw PlatformException(
            code: 'METHOD_NOT_FOUND',
            message: 'Method $method not found',
          );
      }
    } catch (e) {
      throw PlatformException(code: 'METHOD_ERROR', message: e.toString());
    }
  }
}
