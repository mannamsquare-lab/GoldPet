import 'package:freezed_annotation/freezed_annotation.dart';

part 'checkin_models.freezed.dart';
part 'checkin_models.g.dart';

enum PlaceCategory {
  PARK, // 공원
  CAFE, // 펫 카페
  RESTAURANT, // 펫 레스토랑
  HOSPITAL, // 동물병원
  SHOP, // 펫샵
  PLAYGROUND, // 놀이터
  TRAIL, // 산책로
  OTHER, // 기타
}

@freezed
sealed class PlaceResponse with _$PlaceResponse {
  const factory PlaceResponse({
    required int id,
    required String name,
    required PlaceCategory category,
    String? address,
    required double latitude,
    required double longitude,
    String? description,
    String? imageUrl,
    required bool isVerified,
    required int checkinCount,
  }) = _PlaceResponse;

  factory PlaceResponse.fromJson(Map<String, dynamic> json) =>
      _$PlaceResponseFromJson(json);
}

@freezed
sealed class CheckInResponse with _$CheckInResponse {
  const factory CheckInResponse({
    required int id,
    required int userId,
    String? userNickname,
    String? userProfileImage,
    required int placeId,
    required String placeName,
    String? photoUrl,
    String? memo,
    DateTime? createdAt,
  }) = _CheckInResponse;

  factory CheckInResponse.fromJson(Map<String, dynamic> json) =>
      _$CheckInResponseFromJson(json);
}

@freezed
sealed class CreateCheckInRequest with _$CreateCheckInRequest {
  const factory CreateCheckInRequest({
    required int placeId,
    String? photoUrl,
    String? memo,
  }) = _CreateCheckInRequest;

  factory CreateCheckInRequest.fromJson(Map<String, dynamic> json) =>
      _$CreateCheckInRequestFromJson(json);
}

@freezed
sealed class NearbyPlaceRequest with _$NearbyPlaceRequest {
  const factory NearbyPlaceRequest({
    required double latitude,
    required double longitude,
    @Default(1000.0) double radiusMeters,
  }) = _NearbyPlaceRequest;

  factory NearbyPlaceRequest.fromJson(Map<String, dynamic> json) =>
      _$NearbyPlaceRequestFromJson(json);
}
