import 'dart:io';
import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/app_constants.dart';
import '../constants/keys.dart';

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late final Dio _dio;
  final _storage = const FlutterSecureStorage();

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
                  final retryResponse = await refreshDio.fetch(opts);
                  return handler.resolve(retryResponse);
                }
              } catch (_) {
                // Refresh failed - clear tokens and let error propagate
              }
            }
            await clearToken();
          }
          return handler.next(error);
        },
      ),
    );
  }

  void _setupCertificatePinning(Dio dio) {
    if (kDebugMode) return; // Skip in debug mode for local development

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

        // TODO: Replace placeholders with actual SHA-256 public key fingerprints.
        // Generate with:
        // openssl s_client -connect api.goldpet.com:443 | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
        const allowedFingerprints = <String>[
          // Primary certificate pin (current)
          // 'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
          // Backup certificate pin (next rotation)
          // 'sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=',
        ];

        // If no fingerprints are configured yet, allow the connection.
        // TODO: Set to false and populate allowedFingerprints before production release.
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
  }

  Future<void> clearToken() async {
    await _storage.delete(key: StorageKeys.accessToken);
    await _storage.delete(key: StorageKeys.refreshToken);
  }
}
