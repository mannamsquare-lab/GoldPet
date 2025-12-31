// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserModelImpl _$$UserModelImplFromJson(Map<String, dynamic> json) =>
    _$UserModelImpl(
      id: (json['id'] as num).toInt(),
      email: json['email'] as String?,
      nickname: json['nickname'] as String?,
      gender: json['gender'] as String?,
      birthYear: (json['birthYear'] as num?)?.toInt(),
      mainLocationText: json['mainLocationText'] as String?,
      mainLocationLat: (json['mainLocationLat'] as num?)?.toDouble(),
      mainLocationLng: (json['mainLocationLng'] as num?)?.toDouble(),
      profileImageUrl: json['profileImageUrl'] as String?,
      goldBalance: (json['goldBalance'] as num?)?.toInt() ?? 0,
      isActive: json['isActive'] as bool? ?? true,
    );

Map<String, dynamic> _$$UserModelImplToJson(_$UserModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'email': instance.email,
      'nickname': instance.nickname,
      'gender': instance.gender,
      'birthYear': instance.birthYear,
      'mainLocationText': instance.mainLocationText,
      'mainLocationLat': instance.mainLocationLat,
      'mainLocationLng': instance.mainLocationLng,
      'profileImageUrl': instance.profileImageUrl,
      'goldBalance': instance.goldBalance,
      'isActive': instance.isActive,
    };
