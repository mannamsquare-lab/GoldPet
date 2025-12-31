import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';

final authRemoteSourceProvider = Provider<AuthRemoteSource>((ref) {
  return AuthRemoteSource(ApiClient());
});

class AuthRemoteSource {
  final ApiClient _apiClient;

  AuthRemoteSource(this._apiClient);

  Future<Map<String, dynamic>> loginWithProvider(
    String provider,
    String accessToken,
  ) async {
    final response = await _apiClient.post(
      '/api/v1/auth/login/$provider',
      data: {'accessToken': accessToken},
    );
    return response.data;
  }
}
