// Since we are using flutter_naver_map, we might handle bounds differently or pass raw coordinates.
// Let's use raw coordinates for simplicity in provider args.
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/friend_models.dart';
import '../data/friend_repository.dart';

part 'friend_providers.g.dart';

@riverpod
Future<List<FriendLocationModel>> nearbyFriends(
  Ref ref, {
  required double minLat,
  required double minLon,
  required double maxLat,
  required double maxLon,
}) async {
  final repository = ref.read(friendRepositoryProvider);
  return repository.getNearbyFriends(
    minLat: minLat,
    minLon: minLon,
    maxLat: maxLat,
    maxLon: maxLon,
  );
}

@riverpod
Future<List<MatchModel>> myMatches(Ref ref) async {
  final repository = ref.read(friendRepositoryProvider);
  return repository.getMyMatches();
}

@riverpod
class FriendActionController extends _$FriendActionController {
  @override
  FutureOr<void> build() {}

  Future<void> likeUser(int userId) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final repository = ref.read(friendRepositoryProvider);
      await repository.likeUser(userId);
      // Maybe invalidate matches if it was a match?
      ref.invalidate(myMatchesProvider);
    });
  }

  Future<void> blockUser(int userId) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final repository = ref.read(friendRepositoryProvider);
      await repository.blockUser(userId);
      ref.invalidate(myMatchesProvider);
      // Also potentially invalidate nearbyFriends if we want to filter them out instantly
    });
  }
}
