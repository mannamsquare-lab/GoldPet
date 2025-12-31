import 'package:freezed_annotation/freezed_annotation.dart';

part 'community_models.freezed.dart';
part 'community_models.g.dart';

@freezed
sealed class CommunityPostModel with _$CommunityPostModel {
  const factory CommunityPostModel({
    required int id,
    required int userId,
    String? userNickname,
    String? userProfileImage,
    required int categoryId,
    required String categoryName,
    required String title,
    required String content,
    required String visibility, // PUBLIC, PRIVATE, FRIEND
    required String postType, // GENERAL, QUESTION, INFO
    @Default(0) int viewCount,
    @Default(0) int likeCount,
    @Default(0) int commentCount,
    required DateTime createdAt,
    @Default(false) bool isLikedByMe,
    @Default([]) List<String> imageUrls,
  }) = _CommunityPostModel;

  factory CommunityPostModel.fromJson(Map<String, dynamic> json) =>
      _$CommunityPostModelFromJson(json);
}

@freezed
sealed class CommunityCommentModel with _$CommunityCommentModel {
  const factory CommunityCommentModel({
    required int id,
    required int postId,
    required int userId,
    String? userNickname,
    String? userProfileImage,
    required String content,
    required DateTime createdAt,
    int? parentCommentId,
  }) = _CommunityCommentModel;

  factory CommunityCommentModel.fromJson(Map<String, dynamic> json) =>
      _$CommunityCommentModelFromJson(json);
}

@freezed
sealed class CommunityCategoryModel with _$CommunityCategoryModel {
  const factory CommunityCategoryModel({
    required int id,
    required String name,
    required String code,
  }) = _CommunityCategoryModel;

  factory CommunityCategoryModel.fromJson(Map<String, dynamic> json) =>
      _$CommunityCategoryModelFromJson(json);
}

@freezed
sealed class CreatePostRequest with _$CreatePostRequest {
  const factory CreatePostRequest({
    required int categoryId,
    required String title,
    required String content,
    @Default('PUBLIC') String visibility,
    @Default('GENERAL') String postType,
    @Default([]) List<String> imageUrls,
  }) = _CreatePostRequest;

  factory CreatePostRequest.fromJson(Map<String, dynamic> json) =>
      _$CreatePostRequestFromJson(json);
}

@freezed
sealed class CreateCommentRequest with _$CreateCommentRequest {
  const factory CreateCommentRequest({
    required String content,
    int? parentCommentId,
  }) = _CreateCommentRequest;

  factory CreateCommentRequest.fromJson(Map<String, dynamic> json) =>
      _$CreateCommentRequestFromJson(json);
}
