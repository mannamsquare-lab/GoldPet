// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'walk_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$WalkResponseImpl _$$WalkResponseImplFromJson(Map<String, dynamic> json) =>
    _$WalkResponseImpl(
      id: (json['id'] as num).toInt(),
      userId: (json['userId'] as num).toInt(),
      startTime: DateTime.parse(json['startTime'] as String),
      endTime: DateTime.parse(json['endTime'] as String),
      distanceKm: (json['distanceKm'] as num).toDouble(),
      durationSeconds: (json['durationSeconds'] as num).toInt(),
      caloriesBurned: (json['caloriesBurned'] as num?)?.toDouble(),
      notes: json['notes'] as String?,
    );

Map<String, dynamic> _$$WalkResponseImplToJson(_$WalkResponseImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'startTime': instance.startTime.toIso8601String(),
      'endTime': instance.endTime.toIso8601String(),
      'distanceKm': instance.distanceKm,
      'durationSeconds': instance.durationSeconds,
      'caloriesBurned': instance.caloriesBurned,
      'notes': instance.notes,
    };

_$CreateWalkRequestImpl _$$CreateWalkRequestImplFromJson(
  Map<String, dynamic> json,
) => _$CreateWalkRequestImpl(
  startTime: DateTime.parse(json['startTime'] as String),
  endTime: DateTime.parse(json['endTime'] as String),
  distanceKm: (json['distanceKm'] as num).toDouble(),
  durationSeconds: (json['durationSeconds'] as num).toInt(),
  path: (json['path'] as List<dynamic>)
      .map(
        (e) => (e as List<dynamic>).map((e) => (e as num).toDouble()).toList(),
      )
      .toList(),
  caloriesBurned: (json['caloriesBurned'] as num?)?.toDouble(),
  notes: json['notes'] as String?,
);

Map<String, dynamic> _$$CreateWalkRequestImplToJson(
  _$CreateWalkRequestImpl instance,
) => <String, dynamic>{
  'startTime': instance.startTime.toIso8601String(),
  'endTime': instance.endTime.toIso8601String(),
  'distanceKm': instance.distanceKm,
  'durationSeconds': instance.durationSeconds,
  'path': instance.path,
  'caloriesBurned': instance.caloriesBurned,
  'notes': instance.notes,
};
