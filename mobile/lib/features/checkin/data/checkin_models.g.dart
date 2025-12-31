// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'checkin_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$PlaceResponseImpl _$$PlaceResponseImplFromJson(Map<String, dynamic> json) =>
    _$PlaceResponseImpl(
      id: (json['id'] as num).toInt(),
      name: json['name'] as String,
      category: $enumDecode(_$PlaceCategoryEnumMap, json['category']),
      address: json['address'] as String?,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      description: json['description'] as String?,
      imageUrl: json['imageUrl'] as String?,
      isVerified: json['isVerified'] as bool,
      checkinCount: (json['checkinCount'] as num).toInt(),
    );

Map<String, dynamic> _$$PlaceResponseImplToJson(_$PlaceResponseImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'category': _$PlaceCategoryEnumMap[instance.category]!,
      'address': instance.address,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'description': instance.description,
      'imageUrl': instance.imageUrl,
      'isVerified': instance.isVerified,
      'checkinCount': instance.checkinCount,
    };

const _$PlaceCategoryEnumMap = {
  PlaceCategory.PARK: 'PARK',
  PlaceCategory.CAFE: 'CAFE',
  PlaceCategory.RESTAURANT: 'RESTAURANT',
  PlaceCategory.HOSPITAL: 'HOSPITAL',
  PlaceCategory.SHOP: 'SHOP',
  PlaceCategory.PLAYGROUND: 'PLAYGROUND',
  PlaceCategory.TRAIL: 'TRAIL',
  PlaceCategory.OTHER: 'OTHER',
};

_$CheckInResponseImpl _$$CheckInResponseImplFromJson(
  Map<String, dynamic> json,
) => _$CheckInResponseImpl(
  id: (json['id'] as num).toInt(),
  userId: (json['userId'] as num).toInt(),
  userNickname: json['userNickname'] as String?,
  userProfileImage: json['userProfileImage'] as String?,
  placeId: (json['placeId'] as num).toInt(),
  placeName: json['placeName'] as String,
  photoUrl: json['photoUrl'] as String?,
  memo: json['memo'] as String?,
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
);

Map<String, dynamic> _$$CheckInResponseImplToJson(
  _$CheckInResponseImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'userId': instance.userId,
  'userNickname': instance.userNickname,
  'userProfileImage': instance.userProfileImage,
  'placeId': instance.placeId,
  'placeName': instance.placeName,
  'photoUrl': instance.photoUrl,
  'memo': instance.memo,
  'createdAt': instance.createdAt?.toIso8601String(),
};

_$CreateCheckInRequestImpl _$$CreateCheckInRequestImplFromJson(
  Map<String, dynamic> json,
) => _$CreateCheckInRequestImpl(
  placeId: (json['placeId'] as num).toInt(),
  photoUrl: json['photoUrl'] as String?,
  memo: json['memo'] as String?,
);

Map<String, dynamic> _$$CreateCheckInRequestImplToJson(
  _$CreateCheckInRequestImpl instance,
) => <String, dynamic>{
  'placeId': instance.placeId,
  'photoUrl': instance.photoUrl,
  'memo': instance.memo,
};

_$NearbyPlaceRequestImpl _$$NearbyPlaceRequestImplFromJson(
  Map<String, dynamic> json,
) => _$NearbyPlaceRequestImpl(
  latitude: (json['latitude'] as num).toDouble(),
  longitude: (json['longitude'] as num).toDouble(),
  radiusMeters: (json['radiusMeters'] as num?)?.toDouble() ?? 1000.0,
);

Map<String, dynamic> _$$NearbyPlaceRequestImplToJson(
  _$NearbyPlaceRequestImpl instance,
) => <String, dynamic>{
  'latitude': instance.latitude,
  'longitude': instance.longitude,
  'radiusMeters': instance.radiusMeters,
};
