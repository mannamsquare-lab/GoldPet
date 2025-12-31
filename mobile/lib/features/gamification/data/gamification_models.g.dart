// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'gamification_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$BadgeModelImpl _$$BadgeModelImplFromJson(Map<String, dynamic> json) =>
    _$BadgeModelImpl(
      id: (json['id'] as num).toInt(),
      code: json['code'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      imageUrl: json['imageUrl'] as String,
      earnedAt: json['earnedAt'] == null
          ? null
          : DateTime.parse(json['earnedAt'] as String),
    );

Map<String, dynamic> _$$BadgeModelImplToJson(_$BadgeModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'code': instance.code,
      'name': instance.name,
      'description': instance.description,
      'imageUrl': instance.imageUrl,
      'earnedAt': instance.earnedAt?.toIso8601String(),
    };

_$ChallengeModelImpl _$$ChallengeModelImplFromJson(Map<String, dynamic> json) =>
    _$ChallengeModelImpl(
      id: (json['id'] as num).toInt(),
      title: json['title'] as String,
      description: json['description'] as String,
      goalType: json['goalType'] as String,
      goalValue: (json['goalValue'] as num).toInt(),
      rewardGold: (json['rewardGold'] as num?)?.toInt(),
      rewardBadgeName: json['rewardBadgeName'] as String?,
      startDate: DateTime.parse(json['startDate'] as String),
      endDate: DateTime.parse(json['endDate'] as String),
      isActive: json['isActive'] as bool,
    );

Map<String, dynamic> _$$ChallengeModelImplToJson(
  _$ChallengeModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'title': instance.title,
  'description': instance.description,
  'goalType': instance.goalType,
  'goalValue': instance.goalValue,
  'rewardGold': instance.rewardGold,
  'rewardBadgeName': instance.rewardBadgeName,
  'startDate': instance.startDate.toIso8601String(),
  'endDate': instance.endDate.toIso8601String(),
  'isActive': instance.isActive,
};

_$ChallengeProgressModelImpl _$$ChallengeProgressModelImplFromJson(
  Map<String, dynamic> json,
) => _$ChallengeProgressModelImpl(
  challengeId: (json['challengeId'] as num).toInt(),
  challengeTitle: json['challengeTitle'] as String,
  goalValue: (json['goalValue'] as num).toInt(),
  currentValue: (json['currentValue'] as num).toInt(),
  progressPercent: (json['progressPercent'] as num).toInt(),
  status: json['status'] as String,
  completedAt: json['completedAt'] == null
      ? null
      : DateTime.parse(json['completedAt'] as String),
);

Map<String, dynamic> _$$ChallengeProgressModelImplToJson(
  _$ChallengeProgressModelImpl instance,
) => <String, dynamic>{
  'challengeId': instance.challengeId,
  'challengeTitle': instance.challengeTitle,
  'goalValue': instance.goalValue,
  'currentValue': instance.currentValue,
  'progressPercent': instance.progressPercent,
  'status': instance.status,
  'completedAt': instance.completedAt?.toIso8601String(),
};
