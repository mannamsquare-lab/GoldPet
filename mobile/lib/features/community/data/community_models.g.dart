// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'community_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$CommunityPostModelImpl _$$CommunityPostModelImplFromJson(
  Map<String, dynamic> json,
) => _$CommunityPostModelImpl(
  id: (json['id'] as num).toInt(),
  userId: (json['userId'] as num).toInt(),
  userNickname: json['userNickname'] as String?,
  userProfileImage: json['userProfileImage'] as String?,
  categoryId: (json['categoryId'] as num).toInt(),
  categoryName: json['categoryName'] as String,
  title: json['title'] as String,
  content: json['content'] as String,
  visibility: json['visibility'] as String,
  postType: json['postType'] as String,
  viewCount: (json['viewCount'] as num?)?.toInt() ?? 0,
  likeCount: (json['likeCount'] as num?)?.toInt() ?? 0,
  commentCount: (json['commentCount'] as num?)?.toInt() ?? 0,
  createdAt: DateTime.parse(json['createdAt'] as String),
  isLikedByMe: json['isLikedByMe'] as bool? ?? false,
  imageUrls:
      (json['imageUrls'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      const [],
);

Map<String, dynamic> _$$CommunityPostModelImplToJson(
  _$CommunityPostModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'userId': instance.userId,
  'userNickname': instance.userNickname,
  'userProfileImage': instance.userProfileImage,
  'categoryId': instance.categoryId,
  'categoryName': instance.categoryName,
  'title': instance.title,
  'content': instance.content,
  'visibility': instance.visibility,
  'postType': instance.postType,
  'viewCount': instance.viewCount,
  'likeCount': instance.likeCount,
  'commentCount': instance.commentCount,
  'createdAt': instance.createdAt.toIso8601String(),
  'isLikedByMe': instance.isLikedByMe,
  'imageUrls': instance.imageUrls,
};

_$CommunityCommentModelImpl _$$CommunityCommentModelImplFromJson(
  Map<String, dynamic> json,
) => _$CommunityCommentModelImpl(
  id: (json['id'] as num).toInt(),
  postId: (json['postId'] as num).toInt(),
  userId: (json['userId'] as num).toInt(),
  userNickname: json['userNickname'] as String?,
  userProfileImage: json['userProfileImage'] as String?,
  content: json['content'] as String,
  createdAt: DateTime.parse(json['createdAt'] as String),
  parentCommentId: (json['parentCommentId'] as num?)?.toInt(),
);

Map<String, dynamic> _$$CommunityCommentModelImplToJson(
  _$CommunityCommentModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'postId': instance.postId,
  'userId': instance.userId,
  'userNickname': instance.userNickname,
  'userProfileImage': instance.userProfileImage,
  'content': instance.content,
  'createdAt': instance.createdAt.toIso8601String(),
  'parentCommentId': instance.parentCommentId,
};

_$CommunityCategoryModelImpl _$$CommunityCategoryModelImplFromJson(
  Map<String, dynamic> json,
) => _$CommunityCategoryModelImpl(
  id: (json['id'] as num).toInt(),
  name: json['name'] as String,
  code: json['code'] as String,
);

Map<String, dynamic> _$$CommunityCategoryModelImplToJson(
  _$CommunityCategoryModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'code': instance.code,
};

_$CreatePostRequestImpl _$$CreatePostRequestImplFromJson(
  Map<String, dynamic> json,
) => _$CreatePostRequestImpl(
  categoryId: (json['categoryId'] as num).toInt(),
  title: json['title'] as String,
  content: json['content'] as String,
  visibility: json['visibility'] as String? ?? 'PUBLIC',
  postType: json['postType'] as String? ?? 'GENERAL',
  imageUrls:
      (json['imageUrls'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      const [],
);

Map<String, dynamic> _$$CreatePostRequestImplToJson(
  _$CreatePostRequestImpl instance,
) => <String, dynamic>{
  'categoryId': instance.categoryId,
  'title': instance.title,
  'content': instance.content,
  'visibility': instance.visibility,
  'postType': instance.postType,
  'imageUrls': instance.imageUrls,
};

_$CreateCommentRequestImpl _$$CreateCommentRequestImplFromJson(
  Map<String, dynamic> json,
) => _$CreateCommentRequestImpl(
  content: json['content'] as String,
  parentCommentId: (json['parentCommentId'] as num?)?.toInt(),
);

Map<String, dynamic> _$$CreateCommentRequestImplToJson(
  _$CreateCommentRequestImpl instance,
) => <String, dynamic>{
  'content': instance.content,
  'parentCommentId': instance.parentCommentId,
};
