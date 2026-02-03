// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'walk_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$WalkSpotDtoImpl _$$WalkSpotDtoImplFromJson(Map<String, dynamic> json) =>
    _$WalkSpotDtoImpl(
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      type: json['type'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
      imageUrl: json['imageUrl'] as String?,
      note: json['note'] as String?,
    );

Map<String, dynamic> _$$WalkSpotDtoImplToJson(_$WalkSpotDtoImpl instance) =>
    <String, dynamic>{
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'type': instance.type,
      'timestamp': instance.timestamp.toIso8601String(),
      'imageUrl': instance.imageUrl,
      'note': instance.note,
    };

_$WalkResponseImpl _$$WalkResponseImplFromJson(Map<String, dynamic> json) =>
    _$WalkResponseImpl(
      id: (json['id'] as num).toInt(),
      userId: (json['userId'] as num).toInt(),
      startTime: DateTime.parse(json['startTime'] as String),
      endTime: DateTime.parse(json['endTime'] as String),
      distanceKm: (json['distanceKm'] as num).toDouble(),
      durationSeconds: (json['durationSeconds'] as num).toInt(),
      path: (json['path'] as List<dynamic>)
          .map(
            (e) =>
                (e as List<dynamic>).map((e) => (e as num).toDouble()).toList(),
          )
          .toList(),
      spots: (json['spots'] as List<dynamic>)
          .map((e) => WalkSpotDto.fromJson(e as Map<String, dynamic>))
          .toList(),
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
      'path': instance.path,
      'spots': instance.spots,
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
  spots:
      (json['spots'] as List<dynamic>?)
          ?.map((e) => WalkSpotDto.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const [],
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
  'spots': instance.spots,
  'caloriesBurned': instance.caloriesBurned,
  'notes': instance.notes,
};
