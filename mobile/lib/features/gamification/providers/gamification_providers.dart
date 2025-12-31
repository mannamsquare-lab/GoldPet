import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/gamification_models.dart';
import '../data/gamification_repository.dart';

part 'gamification_providers.g.dart';

@riverpod
Future<List<BadgeModel>> myBadges(Ref ref) async {
  final repository = ref.read(gamificationRepositoryProvider);
  return repository.getMyBadges();
}

@riverpod
Future<List<ChallengeModel>> activeChallenges(Ref ref) async {
  final repository = ref.read(gamificationRepositoryProvider);
  return repository.getActiveChallenges();
}

@riverpod
Future<List<ChallengeProgressModel>> myChallengeProgress(Ref ref) async {
  final repository = ref.read(gamificationRepositoryProvider);
  return repository.getMyChallengeProgress();
}
