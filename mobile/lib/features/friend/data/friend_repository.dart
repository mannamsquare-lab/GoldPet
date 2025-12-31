import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import 'friend_models.dart';

final friendRepositoryProvider = Provider<FriendRepository>((ref) {
  return FriendRepository(ref.read(apiClientProvider));
});

class FriendRepository {
  final ApiClient _apiClient;

  FriendRepository(this._apiClient);

  Future<List<FriendLocationModel>> getNearbyFriends({
    required double minLat,
    required double minLon,
    required double maxLat,
    required double maxLon,
  }) async {
    final response = await _apiClient.get(
      '/api/v1/users/search',
      queryParameters: {
        'minLat': minLat,
        'minLon': minLon,
        'maxLat': maxLat,
        'maxLon': maxLon,
      },
    );
    return (response.data as List)
        .map((e) => FriendLocationModel.fromJson(e))
        .toList();
  }

  Future<List<MatchModel>> getMyMatches() async {
    final response = await _apiClient.get('/v1/matches');
    return (response.data as List).map((e) => MatchModel.fromJson(e)).toList();
  }

  Future<Map<String, dynamic>> likeUser(int userId) async {
    final response = await _apiClient.post(
      '/v1/matches/like',
      data: {'toUserId': userId},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<void> blockUser(int userId) async {
    await _apiClient.post('/v1/matches/block', data: {'blockedUserId': userId});
  }
}
