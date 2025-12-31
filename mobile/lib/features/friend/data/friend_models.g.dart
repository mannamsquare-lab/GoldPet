// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'friend_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$FriendLocationModelImpl _$$FriendLocationModelImplFromJson(
  Map<String, dynamic> json,
) => _$FriendLocationModelImpl(
  id: (json['id'] as num).toInt(),
  nickname: json['nickname'] as String?,
  profileImageUrl: json['profileImageUrl'] as String?,
  latitude: (json['latitude'] as num?)?.toDouble(),
  longitude: (json['longitude'] as num?)?.toDouble(),
);

Map<String, dynamic> _$$FriendLocationModelImplToJson(
  _$FriendLocationModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'nickname': instance.nickname,
  'profileImageUrl': instance.profileImageUrl,
  'latitude': instance.latitude,
  'longitude': instance.longitude,
};

_$MatchModelImpl _$$MatchModelImplFromJson(Map<String, dynamic> json) =>
    _$MatchModelImpl(
      matchId: (json['matchId'] as num).toInt(),
      partnerId: (json['partnerId'] as num).toInt(),
      partnerNickname: json['partnerNickname'] as String?,
      partnerProfileImage: json['partnerProfileImage'] as String?,
      matchedAt: json['matchedAt'] as String?,
    );

Map<String, dynamic> _$$MatchModelImplToJson(_$MatchModelImpl instance) =>
    <String, dynamic>{
      'matchId': instance.matchId,
      'partnerId': instance.partnerId,
      'partnerNickname': instance.partnerNickname,
      'partnerProfileImage': instance.partnerProfileImage,
      'matchedAt': instance.matchedAt,
    };

_$LikeRequestImpl _$$LikeRequestImplFromJson(Map<String, dynamic> json) =>
    _$LikeRequestImpl(toUserId: (json['toUserId'] as num).toInt());

Map<String, dynamic> _$$LikeRequestImplToJson(_$LikeRequestImpl instance) =>
    <String, dynamic>{'toUserId': instance.toUserId};

_$BlockRequestImpl _$$BlockRequestImplFromJson(Map<String, dynamic> json) =>
    _$BlockRequestImpl(blockedUserId: (json['blockedUserId'] as num).toInt());

Map<String, dynamic> _$$BlockRequestImplToJson(_$BlockRequestImpl instance) =>
    <String, dynamic>{'blockedUserId': instance.blockedUserId};
