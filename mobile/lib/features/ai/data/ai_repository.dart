import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import 'ai_models.dart';

final aiRepositoryProvider = Provider<AIRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AIRepository(apiClient);
});

class AIRepository {
  final ApiClient _apiClient;

  AIRepository(this._apiClient);

  Future<List<AIStyleOption>> getStyles() async {
    final response = await _apiClient.get('/v1/ai-profile/styles');
    return (response.data as List)
        .map((e) => AIStyleOption.fromJson(e))
        .toList();
  }

  Future<AIProfileRequestResponse> createRequest(
    CreateAIProfileRequest request,
  ) async {
    final response = await _apiClient.post(
      '/v1/ai-profile/requests',
      data: request.toJson(),
    );
    return AIProfileRequestResponse.fromJson(response.data);
  }

  Future<List<AIProfileRequestResponse>> getMyRequests({
    int page = 0,
    int size = 20,
  }) async {
    final response = await _apiClient.get(
      '/v1/ai-profile/requests',
      queryParameters: {'page': page, 'size': size},
    );
    final content = response.data['content'] as List;
    return content.map((e) => AIProfileRequestResponse.fromJson(e)).toList();
  }

  Future<void> cancelRequest(int requestId) async {
    await _apiClient.delete('/v1/ai-profile/requests/$requestId');
  }
}
