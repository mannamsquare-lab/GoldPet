import 'dart:io';
import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/app_constants.dart';
import '../constants/keys.dart';
import '../../features/walk/data/walk_local_storage.dart';
import '../../features/walk/screens/walk_screen.dart';

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late final Dio _dio;
  final _storage = const FlutterSecureStorage();

  /// Auth expiry dedup guard -- prevents multiple dialogs on concurrent 401s
  static bool _isAuthExpired = false;

  /// Prevents concurrent _recoverPendingWalk executions
  /// (setToken is called multiple times during login: login handler + syncAuthToken)
  static bool _isRecoveringWalk = false;

  /// Callback invoked once when auth expires (refresh fails).
  /// Set by HybridWebView to show dialog + redirect to login.
  static VoidCallback? onAuthExpired;

  ApiClient._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: ApiConstants.connectTimeout,
        receiveTimeout: ApiConstants.receiveTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _setupCertificatePinning(_dio);

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: StorageKeys.accessToken);
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            final refreshToken = await _storage.read(key: StorageKeys.refreshToken);
            if (refreshToken != null && refreshToken.isNotEmpty) {
              try {
                // Use a separate Dio instance to avoid interceptor loops
                final refreshDio = Dio(BaseOptions(
                  baseUrl: ApiConstants.baseUrl,
                  headers: {'Content-Type': 'application/json'},
                ));
                final response = await refreshDio.post(
                  '/api/v1/auth/refresh',
                  data: {'refreshToken': refreshToken},
                );
                if (response.statusCode == 200) {
                  final newAccessToken = response.data['accessToken'] as String;
                  final newRefreshToken = response.data['refreshToken'] as String;
                  await setToken(newAccessToken, newRefreshToken);

                  // Retry the original request with new token
                  final opts = error.requestOptions;
                  opts.headers['Authorization'] = 'Bearer $newAccessToken';
                  try {
                    final retryResponse = await refreshDio.fetch(opts);
                    return handler.resolve(retryResponse);
                  } catch (retryError) {
                    debugPrint('[AuthExpiry] Retry after token refresh failed: $retryError');
                    // 토큰 갱신은 성공했으나 원래 요청 재시도 실패 — 원본 에러 전파
                    return handler.next(error);
                  }
                }
              } catch (refreshError) {
                debugPrint('[AuthExpiry] Token refresh failed: $refreshError');
              }
            }
            // Trigger auth expiry callback (dedup: only once)
            // Set flag before async clearToken() to prevent race on concurrent 401s
            if (!_isAuthExpired) {
              _isAuthExpired = true;
              debugPrint('[AuthExpiry] Token refresh failed, showing expiry dialog');
              onAuthExpired?.call();
            }
            await clearToken();
          }
          return handler.next(error);
        },
      ),
    );
  }

  void _setupCertificatePinning(Dio dio) {
    // Skip certificate pinning in debug and profile mode for local development.
    if (kDebugMode || kProfileMode) return;

    (dio.httpClientAdapter as IOHttpClientAdapter).createHttpClient = () {
      final client = HttpClient();
      client.badCertificateCallback = (X509Certificate cert, String host, int port) {
        // Only allow connections to our known hosts
        const allowedHosts = [
          'api.goldpet.com',
          'api.mannamsquare.com',
        ];

        if (!allowedHosts.contains(host)) {
          return false;
        }

        // TODO: Add actual certificate fingerprints for production domains.
        // Once fingerprints are added, change release mode to return false (fail-closed).
        // Requires: extract SHA-256 fingerprints from api.goldpet.com and api.mannamsquare.com.
        // Generate with:
        // openssl s_client -connect api.goldpet.com:443 | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
        const allowedFingerprints = <String>[
          // Primary certificate pin (current)
          // 'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
          // Backup certificate pin (next rotation)
          // 'sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=',
        ];

        // If no fingerprints are configured yet, allow the connection in release mode.
        // TODO: Once fingerprints are populated, change this to return false (fail-closed).
        if (allowedFingerprints.isEmpty) {
          return true;
        }

        // Reject by default once fingerprints are configured.
        return false;
      };
      return client;
    };
  }

  Dio get dio => _dio;

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) {
    return _dio.get<T>(path, queryParameters: queryParameters);
  }

  Future<Response<T>> post<T>(String path, {dynamic data}) {
    return _dio.post<T>(path, data: data);
  }

  Future<Response<T>> put<T>(String path, {dynamic data}) {
    return _dio.put<T>(path, data: data);
  }

  Future<Response<T>> delete<T>(String path) {
    return _dio.delete<T>(path);
  }

  Future<void> setToken(String accessToken, String refreshToken) async {
    await _storage.write(key: StorageKeys.accessToken, value: accessToken);
    await _storage.write(key: StorageKeys.refreshToken, value: refreshToken);
    // Reset auth expiry flag on re-login
    _isAuthExpired = false;
    // 재로그인 후 보류된 산책 데이터 자동 복구 시도
    _recoverPendingWalk();
  }

  /// 로컬에 저장된 보류 산책 데이터를 서버에 전송.
  /// setToken()에서 호출되며, 보류 데이터가 없으면 no-op.
  /// 산책 화면이 활성 중이면 복구를 건너뜀 (새 산책과의 충돌 방지).
  /// 인터셉터가 없는 별도 Dio를 사용하여 401 재진입 루프를 방지.
  Future<void> _recoverPendingWalk() async {
    // 동시 실행 방지: setToken이 login + syncAuthToken에서 2회 호출되므로
    // 첫 번째 호출만 실행하고 두 번째는 건너뜀
    if (_isRecoveringWalk) {
      debugPrint('[WalkRecovery] Already recovering, skipping duplicate');
      return;
    }
    _isRecoveringWalk = true;
    try {
      // 산책 화면이 활성 중이면 복구 건너뜀
      if (WalkScreen.isOnStack) return;

      final walkData = await WalkLocalStorage.loadWalkData();
      if (walkData == null) return;

      // 인터셉터 없는 별도 Dio로 전송 (401 재진입 방지)
      final token = await _storage.read(key: StorageKeys.accessToken);
      if (token == null) return;
      final recoveryDio = Dio(BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ));
      final response = await recoveryDio.post('/api/v1/walks', data: walkData.toJson());
      if (response.statusCode == 200 || response.statusCode == 201) {
        await WalkLocalStorage.clearWalkData();
        debugPrint('[WalkRecovery] Pending walk saved successfully');
      }
    } catch (e) {
      debugPrint('[WalkRecovery] Failed to recover pending walk: $e');
      // 실패 시 로컬 데이터 유지 — 다음 setToken() 호출 시 재시도
    } finally {
      _isRecoveringWalk = false;
    }
  }

  Future<void> clearToken() async {
    await _storage.delete(key: StorageKeys.accessToken);
    await _storage.delete(key: StorageKeys.refreshToken);
    _isAuthExpired = false;
  }

  /// 산책 시작 전 토큰을 사전 갱신하여 만료 확률을 최소화.
  /// 실패해도 산책은 진행됨 (non-blocking).
  Future<void> refreshTokenIfNeeded() async {
    final refreshToken = await _storage.read(key: StorageKeys.refreshToken);
    if (refreshToken == null || refreshToken.isEmpty) return;
    await _performTokenRefresh(refreshToken);
  }

  /// 토큰 갱신 공통 로직. 인터셉터와 refreshTokenIfNeeded()에서 공유.
  Future<void> _performTokenRefresh(String refreshToken) async {
    final refreshDio = Dio(BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      headers: {'Content-Type': 'application/json'},
    ));
    final response = await refreshDio.post(
      '/api/v1/auth/refresh',
      data: {'refreshToken': refreshToken},
    );
    if (response.statusCode == 200) {
      final newAccessToken = response.data['accessToken'] as String;
      final newRefreshToken = response.data['refreshToken'] as String;
      await setToken(newAccessToken, newRefreshToken);
    }
  }
}
