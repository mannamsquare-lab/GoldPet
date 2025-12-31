import 'package:freezed_annotation/freezed_annotation.dart';

part 'friend_models.freezed.dart';
part 'friend_models.g.dart';

@freezed
sealed class FriendLocationModel with _$FriendLocationModel {
  const factory FriendLocationModel({
    required int id,
    String? nickname,
    String? profileImageUrl,
    double? latitude,
    double? longitude,
  }) = _FriendLocationModel;

  factory FriendLocationModel.fromJson(Map<String, dynamic> json) =>
      _$FriendLocationModelFromJson(json);
}

@freezed
sealed class MatchModel with _$MatchModel {
  const factory MatchModel({
    required int matchId,
    required int partnerId,
    String? partnerNickname,
    String? partnerProfileImage,
    String? matchedAt,
  }) = _MatchModel;

  factory MatchModel.fromJson(Map<String, dynamic> json) =>
      _$MatchModelFromJson(json);
}

@freezed
sealed class LikeRequest with _$LikeRequest {
  const factory LikeRequest({required int toUserId}) = _LikeRequest;

  factory LikeRequest.fromJson(Map<String, dynamic> json) =>
      _$LikeRequestFromJson(json);
}

@freezed
sealed class BlockRequest with _$BlockRequest {
  const factory BlockRequest({required int blockedUserId}) = _BlockRequest;

  factory BlockRequest.fromJson(Map<String, dynamic> json) =>
      _$BlockRequestFromJson(json);
}
