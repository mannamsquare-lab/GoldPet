import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import 'gamification_models.dart';

final gamificationRepositoryProvider = Provider<GamificationRepository>((ref) {
  return GamificationRepository(ref.read(apiClientProvider));
});

class GamificationRepository {
  final ApiClient _apiClient;

  GamificationRepository(this._apiClient);

  Future<List<BadgeModel>> getAllBadges() async {
    final response = await _apiClient.get('/api/v1/gamification/badges');
    return (response.data as List).map((e) => BadgeModel.fromJson(e)).toList();
  }

  Future<List<BadgeModel>> getMyBadges() async {
    final response = await _apiClient.get('/api/v1/gamification/my-badges');
    return (response.data as List).map((e) => BadgeModel.fromJson(e)).toList();
  }

  Future<List<ChallengeModel>> getActiveChallenges() async {
    final response = await _apiClient.get('/api/v1/gamification/challenges');
    return (response.data as List)
        .map((e) => ChallengeModel.fromJson(e))
        .toList();
  }

  Future<List<ChallengeProgressModel>> getMyChallengeProgress() async {
    final response = await _apiClient.get('/api/v1/gamification/my-challenges');
    return (response.data as List)
        .map((e) => ChallengeProgressModel.fromJson(e))
        .toList();
  }
}
