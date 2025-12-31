import 'package:freezed_annotation/freezed_annotation.dart';

part 'gamification_models.freezed.dart';
part 'gamification_models.g.dart';

@freezed
sealed class BadgeModel with _$BadgeModel {
  const factory BadgeModel({
    required int id,
    required String code,
    required String name,
    required String description,
    required String imageUrl,
    DateTime? earnedAt,
  }) = _BadgeModel;

  factory BadgeModel.fromJson(Map<String, dynamic> json) =>
      _$BadgeModelFromJson(json);
}

@freezed
sealed class ChallengeModel with _$ChallengeModel {
  const factory ChallengeModel({
    required int id,
    required String title,
    required String description,
    required String goalType, // DISTANCE, WALK_COUNT, etc.
    required int goalValue,
    int? rewardGold,
    String? rewardBadgeName,
    required DateTime startDate,
    required DateTime endDate,
    required bool isActive,
  }) = _ChallengeModel;

  factory ChallengeModel.fromJson(Map<String, dynamic> json) =>
      _$ChallengeModelFromJson(json);
}

@freezed
sealed class ChallengeProgressModel with _$ChallengeProgressModel {
  const factory ChallengeProgressModel({
    required int challengeId,
    required String challengeTitle,
    required int goalValue,
    required int currentValue,
    required int progressPercent,
    required String status, // IN_PROGRESS, COMPLETED, FAILED
    DateTime? completedAt,
  }) = _ChallengeProgressModel;

  factory ChallengeProgressModel.fromJson(Map<String, dynamic> json) =>
      _$ChallengeProgressModelFromJson(json);
}
