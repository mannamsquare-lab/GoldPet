// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'community_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

CommunityPostModel _$CommunityPostModelFromJson(Map<String, dynamic> json) {
  return _CommunityPostModel.fromJson(json);
}

/// @nodoc
mixin _$CommunityPostModel {
  int get id => throw _privateConstructorUsedError;
  int get userId => throw _privateConstructorUsedError;
  String? get userNickname => throw _privateConstructorUsedError;
  String? get userProfileImage => throw _privateConstructorUsedError;
  int get categoryId => throw _privateConstructorUsedError;
  String get categoryName => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String get content => throw _privateConstructorUsedError;
  String get visibility =>
      throw _privateConstructorUsedError; // PUBLIC, PRIVATE, FRIEND
  String get postType =>
      throw _privateConstructorUsedError; // GENERAL, QUESTION, INFO
  int get viewCount => throw _privateConstructorUsedError;
  int get likeCount => throw _privateConstructorUsedError;
  int get commentCount => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  bool get isLikedByMe => throw _privateConstructorUsedError;
  List<String> get imageUrls => throw _privateConstructorUsedError;

  /// Serializes this CommunityPostModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CommunityPostModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CommunityPostModelCopyWith<CommunityPostModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CommunityPostModelCopyWith<$Res> {
  factory $CommunityPostModelCopyWith(
    CommunityPostModel value,
    $Res Function(CommunityPostModel) then,
  ) = _$CommunityPostModelCopyWithImpl<$Res, CommunityPostModel>;
  @useResult
  $Res call({
    int id,
    int userId,
    String? userNickname,
    String? userProfileImage,
    int categoryId,
    String categoryName,
    String title,
    String content,
    String visibility,
    String postType,
    int viewCount,
    int likeCount,
    int commentCount,
    DateTime createdAt,
    bool isLikedByMe,
    List<String> imageUrls,
  });
}

/// @nodoc
class _$CommunityPostModelCopyWithImpl<$Res, $Val extends CommunityPostModel>
    implements $CommunityPostModelCopyWith<$Res> {
  _$CommunityPostModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CommunityPostModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? userNickname = freezed,
    Object? userProfileImage = freezed,
    Object? categoryId = null,
    Object? categoryName = null,
    Object? title = null,
    Object? content = null,
    Object? visibility = null,
    Object? postType = null,
    Object? viewCount = null,
    Object? likeCount = null,
    Object? commentCount = null,
    Object? createdAt = null,
    Object? isLikedByMe = null,
    Object? imageUrls = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            userId: null == userId
                ? _value.userId
                : userId // ignore: cast_nullable_to_non_nullable
                      as int,
            userNickname: freezed == userNickname
                ? _value.userNickname
                : userNickname // ignore: cast_nullable_to_non_nullable
                      as String?,
            userProfileImage: freezed == userProfileImage
                ? _value.userProfileImage
                : userProfileImage // ignore: cast_nullable_to_non_nullable
                      as String?,
            categoryId: null == categoryId
                ? _value.categoryId
                : categoryId // ignore: cast_nullable_to_non_nullable
                      as int,
            categoryName: null == categoryName
                ? _value.categoryName
                : categoryName // ignore: cast_nullable_to_non_nullable
                      as String,
            title: null == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                      as String,
            content: null == content
                ? _value.content
                : content // ignore: cast_nullable_to_non_nullable
                      as String,
            visibility: null == visibility
                ? _value.visibility
                : visibility // ignore: cast_nullable_to_non_nullable
                      as String,
            postType: null == postType
                ? _value.postType
                : postType // ignore: cast_nullable_to_non_nullable
                      as String,
            viewCount: null == viewCount
                ? _value.viewCount
                : viewCount // ignore: cast_nullable_to_non_nullable
                      as int,
            likeCount: null == likeCount
                ? _value.likeCount
                : likeCount // ignore: cast_nullable_to_non_nullable
                      as int,
            commentCount: null == commentCount
                ? _value.commentCount
                : commentCount // ignore: cast_nullable_to_non_nullable
                      as int,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            isLikedByMe: null == isLikedByMe
                ? _value.isLikedByMe
                : isLikedByMe // ignore: cast_nullable_to_non_nullable
                      as bool,
            imageUrls: null == imageUrls
                ? _value.imageUrls
                : imageUrls // ignore: cast_nullable_to_non_nullable
                      as List<String>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CommunityPostModelImplCopyWith<$Res>
    implements $CommunityPostModelCopyWith<$Res> {
  factory _$$CommunityPostModelImplCopyWith(
    _$CommunityPostModelImpl value,
    $Res Function(_$CommunityPostModelImpl) then,
  ) = __$$CommunityPostModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    int userId,
    String? userNickname,
    String? userProfileImage,
    int categoryId,
    String categoryName,
    String title,
    String content,
    String visibility,
    String postType,
    int viewCount,
    int likeCount,
    int commentCount,
    DateTime createdAt,
    bool isLikedByMe,
    List<String> imageUrls,
  });
}

/// @nodoc
class __$$CommunityPostModelImplCopyWithImpl<$Res>
    extends _$CommunityPostModelCopyWithImpl<$Res, _$CommunityPostModelImpl>
    implements _$$CommunityPostModelImplCopyWith<$Res> {
  __$$CommunityPostModelImplCopyWithImpl(
    _$CommunityPostModelImpl _value,
    $Res Function(_$CommunityPostModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CommunityPostModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? userNickname = freezed,
    Object? userProfileImage = freezed,
    Object? categoryId = null,
    Object? categoryName = null,
    Object? title = null,
    Object? content = null,
    Object? visibility = null,
    Object? postType = null,
    Object? viewCount = null,
    Object? likeCount = null,
    Object? commentCount = null,
    Object? createdAt = null,
    Object? isLikedByMe = null,
    Object? imageUrls = null,
  }) {
    return _then(
      _$CommunityPostModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        userId: null == userId
            ? _value.userId
            : userId // ignore: cast_nullable_to_non_nullable
                  as int,
        userNickname: freezed == userNickname
            ? _value.userNickname
            : userNickname // ignore: cast_nullable_to_non_nullable
                  as String?,
        userProfileImage: freezed == userProfileImage
            ? _value.userProfileImage
            : userProfileImage // ignore: cast_nullable_to_non_nullable
                  as String?,
        categoryId: null == categoryId
            ? _value.categoryId
            : categoryId // ignore: cast_nullable_to_non_nullable
                  as int,
        categoryName: null == categoryName
            ? _value.categoryName
            : categoryName // ignore: cast_nullable_to_non_nullable
                  as String,
        title: null == title
            ? _value.title
            : title // ignore: cast_nullable_to_non_nullable
                  as String,
        content: null == content
            ? _value.content
            : content // ignore: cast_nullable_to_non_nullable
                  as String,
        visibility: null == visibility
            ? _value.visibility
            : visibility // ignore: cast_nullable_to_non_nullable
                  as String,
        postType: null == postType
            ? _value.postType
            : postType // ignore: cast_nullable_to_non_nullable
                  as String,
        viewCount: null == viewCount
            ? _value.viewCount
            : viewCount // ignore: cast_nullable_to_non_nullable
                  as int,
        likeCount: null == likeCount
            ? _value.likeCount
            : likeCount // ignore: cast_nullable_to_non_nullable
                  as int,
        commentCount: null == commentCount
            ? _value.commentCount
            : commentCount // ignore: cast_nullable_to_non_nullable
                  as int,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        isLikedByMe: null == isLikedByMe
            ? _value.isLikedByMe
            : isLikedByMe // ignore: cast_nullable_to_non_nullable
                  as bool,
        imageUrls: null == imageUrls
            ? _value._imageUrls
            : imageUrls // ignore: cast_nullable_to_non_nullable
                  as List<String>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$CommunityPostModelImpl implements _CommunityPostModel {
  const _$CommunityPostModelImpl({
    required this.id,
    required this.userId,
    this.userNickname,
    this.userProfileImage,
    required this.categoryId,
    required this.categoryName,
    required this.title,
    required this.content,
    required this.visibility,
    required this.postType,
    this.viewCount = 0,
    this.likeCount = 0,
    this.commentCount = 0,
    required this.createdAt,
    this.isLikedByMe = false,
    final List<String> imageUrls = const [],
  }) : _imageUrls = imageUrls;

  factory _$CommunityPostModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$CommunityPostModelImplFromJson(json);

  @override
  final int id;
  @override
  final int userId;
  @override
  final String? userNickname;
  @override
  final String? userProfileImage;
  @override
  final int categoryId;
  @override
  final String categoryName;
  @override
  final String title;
  @override
  final String content;
  @override
  final String visibility;
  // PUBLIC, PRIVATE, FRIEND
  @override
  final String postType;
  // GENERAL, QUESTION, INFO
  @override
  @JsonKey()
  final int viewCount;
  @override
  @JsonKey()
  final int likeCount;
  @override
  @JsonKey()
  final int commentCount;
  @override
  final DateTime createdAt;
  @override
  @JsonKey()
  final bool isLikedByMe;
  final List<String> _imageUrls;
  @override
  @JsonKey()
  List<String> get imageUrls {
    if (_imageUrls is EqualUnmodifiableListView) return _imageUrls;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_imageUrls);
  }

  @override
  String toString() {
    return 'CommunityPostModel(id: $id, userId: $userId, userNickname: $userNickname, userProfileImage: $userProfileImage, categoryId: $categoryId, categoryName: $categoryName, title: $title, content: $content, visibility: $visibility, postType: $postType, viewCount: $viewCount, likeCount: $likeCount, commentCount: $commentCount, createdAt: $createdAt, isLikedByMe: $isLikedByMe, imageUrls: $imageUrls)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CommunityPostModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.userNickname, userNickname) ||
                other.userNickname == userNickname) &&
            (identical(other.userProfileImage, userProfileImage) ||
                other.userProfileImage == userProfileImage) &&
            (identical(other.categoryId, categoryId) ||
                other.categoryId == categoryId) &&
            (identical(other.categoryName, categoryName) ||
                other.categoryName == categoryName) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.visibility, visibility) ||
                other.visibility == visibility) &&
            (identical(other.postType, postType) ||
                other.postType == postType) &&
            (identical(other.viewCount, viewCount) ||
                other.viewCount == viewCount) &&
            (identical(other.likeCount, likeCount) ||
                other.likeCount == likeCount) &&
            (identical(other.commentCount, commentCount) ||
                other.commentCount == commentCount) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.isLikedByMe, isLikedByMe) ||
                other.isLikedByMe == isLikedByMe) &&
            const DeepCollectionEquality().equals(
              other._imageUrls,
              _imageUrls,
            ));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    userId,
    userNickname,
    userProfileImage,
    categoryId,
    categoryName,
    title,
    content,
    visibility,
    postType,
    viewCount,
    likeCount,
    commentCount,
    createdAt,
    isLikedByMe,
    const DeepCollectionEquality().hash(_imageUrls),
  );

  /// Create a copy of CommunityPostModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CommunityPostModelImplCopyWith<_$CommunityPostModelImpl> get copyWith =>
      __$$CommunityPostModelImplCopyWithImpl<_$CommunityPostModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$CommunityPostModelImplToJson(this);
  }
}

abstract class _CommunityPostModel implements CommunityPostModel {
  const factory _CommunityPostModel({
    required final int id,
    required final int userId,
    final String? userNickname,
    final String? userProfileImage,
    required final int categoryId,
    required final String categoryName,
    required final String title,
    required final String content,
    required final String visibility,
    required final String postType,
    final int viewCount,
    final int likeCount,
    final int commentCount,
    required final DateTime createdAt,
    final bool isLikedByMe,
    final List<String> imageUrls,
  }) = _$CommunityPostModelImpl;

  factory _CommunityPostModel.fromJson(Map<String, dynamic> json) =
      _$CommunityPostModelImpl.fromJson;

  @override
  int get id;
  @override
  int get userId;
  @override
  String? get userNickname;
  @override
  String? get userProfileImage;
  @override
  int get categoryId;
  @override
  String get categoryName;
  @override
  String get title;
  @override
  String get content;
  @override
  String get visibility; // PUBLIC, PRIVATE, FRIEND
  @override
  String get postType; // GENERAL, QUESTION, INFO
  @override
  int get viewCount;
  @override
  int get likeCount;
  @override
  int get commentCount;
  @override
  DateTime get createdAt;
  @override
  bool get isLikedByMe;
  @override
  List<String> get imageUrls;

  /// Create a copy of CommunityPostModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CommunityPostModelImplCopyWith<_$CommunityPostModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

CommunityCommentModel _$CommunityCommentModelFromJson(
  Map<String, dynamic> json,
) {
  return _CommunityCommentModel.fromJson(json);
}

/// @nodoc
mixin _$CommunityCommentModel {
  int get id => throw _privateConstructorUsedError;
  int get postId => throw _privateConstructorUsedError;
  int get userId => throw _privateConstructorUsedError;
  String? get userNickname => throw _privateConstructorUsedError;
  String? get userProfileImage => throw _privateConstructorUsedError;
  String get content => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  int? get parentCommentId => throw _privateConstructorUsedError;

  /// Serializes this CommunityCommentModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CommunityCommentModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CommunityCommentModelCopyWith<CommunityCommentModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CommunityCommentModelCopyWith<$Res> {
  factory $CommunityCommentModelCopyWith(
    CommunityCommentModel value,
    $Res Function(CommunityCommentModel) then,
  ) = _$CommunityCommentModelCopyWithImpl<$Res, CommunityCommentModel>;
  @useResult
  $Res call({
    int id,
    int postId,
    int userId,
    String? userNickname,
    String? userProfileImage,
    String content,
    DateTime createdAt,
    int? parentCommentId,
  });
}

/// @nodoc
class _$CommunityCommentModelCopyWithImpl<
  $Res,
  $Val extends CommunityCommentModel
>
    implements $CommunityCommentModelCopyWith<$Res> {
  _$CommunityCommentModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CommunityCommentModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? postId = null,
    Object? userId = null,
    Object? userNickname = freezed,
    Object? userProfileImage = freezed,
    Object? content = null,
    Object? createdAt = null,
    Object? parentCommentId = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            postId: null == postId
                ? _value.postId
                : postId // ignore: cast_nullable_to_non_nullable
                      as int,
            userId: null == userId
                ? _value.userId
                : userId // ignore: cast_nullable_to_non_nullable
                      as int,
            userNickname: freezed == userNickname
                ? _value.userNickname
                : userNickname // ignore: cast_nullable_to_non_nullable
                      as String?,
            userProfileImage: freezed == userProfileImage
                ? _value.userProfileImage
                : userProfileImage // ignore: cast_nullable_to_non_nullable
                      as String?,
            content: null == content
                ? _value.content
                : content // ignore: cast_nullable_to_non_nullable
                      as String,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            parentCommentId: freezed == parentCommentId
                ? _value.parentCommentId
                : parentCommentId // ignore: cast_nullable_to_non_nullable
                      as int?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CommunityCommentModelImplCopyWith<$Res>
    implements $CommunityCommentModelCopyWith<$Res> {
  factory _$$CommunityCommentModelImplCopyWith(
    _$CommunityCommentModelImpl value,
    $Res Function(_$CommunityCommentModelImpl) then,
  ) = __$$CommunityCommentModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    int postId,
    int userId,
    String? userNickname,
    String? userProfileImage,
    String content,
    DateTime createdAt,
    int? parentCommentId,
  });
}

/// @nodoc
class __$$CommunityCommentModelImplCopyWithImpl<$Res>
    extends
        _$CommunityCommentModelCopyWithImpl<$Res, _$CommunityCommentModelImpl>
    implements _$$CommunityCommentModelImplCopyWith<$Res> {
  __$$CommunityCommentModelImplCopyWithImpl(
    _$CommunityCommentModelImpl _value,
    $Res Function(_$CommunityCommentModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CommunityCommentModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? postId = null,
    Object? userId = null,
    Object? userNickname = freezed,
    Object? userProfileImage = freezed,
    Object? content = null,
    Object? createdAt = null,
    Object? parentCommentId = freezed,
  }) {
    return _then(
      _$CommunityCommentModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        postId: null == postId
            ? _value.postId
            : postId // ignore: cast_nullable_to_non_nullable
                  as int,
        userId: null == userId
            ? _value.userId
            : userId // ignore: cast_nullable_to_non_nullable
                  as int,
        userNickname: freezed == userNickname
            ? _value.userNickname
            : userNickname // ignore: cast_nullable_to_non_nullable
                  as String?,
        userProfileImage: freezed == userProfileImage
            ? _value.userProfileImage
            : userProfileImage // ignore: cast_nullable_to_non_nullable
                  as String?,
        content: null == content
            ? _value.content
            : content // ignore: cast_nullable_to_non_nullable
                  as String,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        parentCommentId: freezed == parentCommentId
            ? _value.parentCommentId
            : parentCommentId // ignore: cast_nullable_to_non_nullable
                  as int?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$CommunityCommentModelImpl implements _CommunityCommentModel {
  const _$CommunityCommentModelImpl({
    required this.id,
    required this.postId,
    required this.userId,
    this.userNickname,
    this.userProfileImage,
    required this.content,
    required this.createdAt,
    this.parentCommentId,
  });

  factory _$CommunityCommentModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$CommunityCommentModelImplFromJson(json);

  @override
  final int id;
  @override
  final int postId;
  @override
  final int userId;
  @override
  final String? userNickname;
  @override
  final String? userProfileImage;
  @override
  final String content;
  @override
  final DateTime createdAt;
  @override
  final int? parentCommentId;

  @override
  String toString() {
    return 'CommunityCommentModel(id: $id, postId: $postId, userId: $userId, userNickname: $userNickname, userProfileImage: $userProfileImage, content: $content, createdAt: $createdAt, parentCommentId: $parentCommentId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CommunityCommentModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.postId, postId) || other.postId == postId) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.userNickname, userNickname) ||
                other.userNickname == userNickname) &&
            (identical(other.userProfileImage, userProfileImage) ||
                other.userProfileImage == userProfileImage) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.parentCommentId, parentCommentId) ||
                other.parentCommentId == parentCommentId));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    postId,
    userId,
    userNickname,
    userProfileImage,
    content,
    createdAt,
    parentCommentId,
  );

  /// Create a copy of CommunityCommentModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CommunityCommentModelImplCopyWith<_$CommunityCommentModelImpl>
  get copyWith =>
      __$$CommunityCommentModelImplCopyWithImpl<_$CommunityCommentModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$CommunityCommentModelImplToJson(this);
  }
}

abstract class _CommunityCommentModel implements CommunityCommentModel {
  const factory _CommunityCommentModel({
    required final int id,
    required final int postId,
    required final int userId,
    final String? userNickname,
    final String? userProfileImage,
    required final String content,
    required final DateTime createdAt,
    final int? parentCommentId,
  }) = _$CommunityCommentModelImpl;

  factory _CommunityCommentModel.fromJson(Map<String, dynamic> json) =
      _$CommunityCommentModelImpl.fromJson;

  @override
  int get id;
  @override
  int get postId;
  @override
  int get userId;
  @override
  String? get userNickname;
  @override
  String? get userProfileImage;
  @override
  String get content;
  @override
  DateTime get createdAt;
  @override
  int? get parentCommentId;

  /// Create a copy of CommunityCommentModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CommunityCommentModelImplCopyWith<_$CommunityCommentModelImpl>
  get copyWith => throw _privateConstructorUsedError;
}

CommunityCategoryModel _$CommunityCategoryModelFromJson(
  Map<String, dynamic> json,
) {
  return _CommunityCategoryModel.fromJson(json);
}

/// @nodoc
mixin _$CommunityCategoryModel {
  int get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get code => throw _privateConstructorUsedError;

  /// Serializes this CommunityCategoryModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CommunityCategoryModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CommunityCategoryModelCopyWith<CommunityCategoryModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CommunityCategoryModelCopyWith<$Res> {
  factory $CommunityCategoryModelCopyWith(
    CommunityCategoryModel value,
    $Res Function(CommunityCategoryModel) then,
  ) = _$CommunityCategoryModelCopyWithImpl<$Res, CommunityCategoryModel>;
  @useResult
  $Res call({int id, String name, String code});
}

/// @nodoc
class _$CommunityCategoryModelCopyWithImpl<
  $Res,
  $Val extends CommunityCategoryModel
>
    implements $CommunityCategoryModelCopyWith<$Res> {
  _$CommunityCategoryModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CommunityCategoryModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? id = null, Object? name = null, Object? code = null}) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            code: null == code
                ? _value.code
                : code // ignore: cast_nullable_to_non_nullable
                      as String,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CommunityCategoryModelImplCopyWith<$Res>
    implements $CommunityCategoryModelCopyWith<$Res> {
  factory _$$CommunityCategoryModelImplCopyWith(
    _$CommunityCategoryModelImpl value,
    $Res Function(_$CommunityCategoryModelImpl) then,
  ) = __$$CommunityCategoryModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int id, String name, String code});
}

/// @nodoc
class __$$CommunityCategoryModelImplCopyWithImpl<$Res>
    extends
        _$CommunityCategoryModelCopyWithImpl<$Res, _$CommunityCategoryModelImpl>
    implements _$$CommunityCategoryModelImplCopyWith<$Res> {
  __$$CommunityCategoryModelImplCopyWithImpl(
    _$CommunityCategoryModelImpl _value,
    $Res Function(_$CommunityCategoryModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CommunityCategoryModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? id = null, Object? name = null, Object? code = null}) {
    return _then(
      _$CommunityCategoryModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        code: null == code
            ? _value.code
            : code // ignore: cast_nullable_to_non_nullable
                  as String,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$CommunityCategoryModelImpl implements _CommunityCategoryModel {
  const _$CommunityCategoryModelImpl({
    required this.id,
    required this.name,
    required this.code,
  });

  factory _$CommunityCategoryModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$CommunityCategoryModelImplFromJson(json);

  @override
  final int id;
  @override
  final String name;
  @override
  final String code;

  @override
  String toString() {
    return 'CommunityCategoryModel(id: $id, name: $name, code: $code)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CommunityCategoryModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.code, code) || other.code == code));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, code);

  /// Create a copy of CommunityCategoryModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CommunityCategoryModelImplCopyWith<_$CommunityCategoryModelImpl>
  get copyWith =>
      __$$CommunityCategoryModelImplCopyWithImpl<_$CommunityCategoryModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$CommunityCategoryModelImplToJson(this);
  }
}

abstract class _CommunityCategoryModel implements CommunityCategoryModel {
  const factory _CommunityCategoryModel({
    required final int id,
    required final String name,
    required final String code,
  }) = _$CommunityCategoryModelImpl;

  factory _CommunityCategoryModel.fromJson(Map<String, dynamic> json) =
      _$CommunityCategoryModelImpl.fromJson;

  @override
  int get id;
  @override
  String get name;
  @override
  String get code;

  /// Create a copy of CommunityCategoryModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CommunityCategoryModelImplCopyWith<_$CommunityCategoryModelImpl>
  get copyWith => throw _privateConstructorUsedError;
}

CreatePostRequest _$CreatePostRequestFromJson(Map<String, dynamic> json) {
  return _CreatePostRequest.fromJson(json);
}

/// @nodoc
mixin _$CreatePostRequest {
  int get categoryId => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String get content => throw _privateConstructorUsedError;
  String get visibility => throw _privateConstructorUsedError;
  String get postType => throw _privateConstructorUsedError;
  List<String> get imageUrls => throw _privateConstructorUsedError;

  /// Serializes this CreatePostRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CreatePostRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CreatePostRequestCopyWith<CreatePostRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CreatePostRequestCopyWith<$Res> {
  factory $CreatePostRequestCopyWith(
    CreatePostRequest value,
    $Res Function(CreatePostRequest) then,
  ) = _$CreatePostRequestCopyWithImpl<$Res, CreatePostRequest>;
  @useResult
  $Res call({
    int categoryId,
    String title,
    String content,
    String visibility,
    String postType,
    List<String> imageUrls,
  });
}

/// @nodoc
class _$CreatePostRequestCopyWithImpl<$Res, $Val extends CreatePostRequest>
    implements $CreatePostRequestCopyWith<$Res> {
  _$CreatePostRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CreatePostRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? categoryId = null,
    Object? title = null,
    Object? content = null,
    Object? visibility = null,
    Object? postType = null,
    Object? imageUrls = null,
  }) {
    return _then(
      _value.copyWith(
            categoryId: null == categoryId
                ? _value.categoryId
                : categoryId // ignore: cast_nullable_to_non_nullable
                      as int,
            title: null == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                      as String,
            content: null == content
                ? _value.content
                : content // ignore: cast_nullable_to_non_nullable
                      as String,
            visibility: null == visibility
                ? _value.visibility
                : visibility // ignore: cast_nullable_to_non_nullable
                      as String,
            postType: null == postType
                ? _value.postType
                : postType // ignore: cast_nullable_to_non_nullable
                      as String,
            imageUrls: null == imageUrls
                ? _value.imageUrls
                : imageUrls // ignore: cast_nullable_to_non_nullable
                      as List<String>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CreatePostRequestImplCopyWith<$Res>
    implements $CreatePostRequestCopyWith<$Res> {
  factory _$$CreatePostRequestImplCopyWith(
    _$CreatePostRequestImpl value,
    $Res Function(_$CreatePostRequestImpl) then,
  ) = __$$CreatePostRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int categoryId,
    String title,
    String content,
    String visibility,
    String postType,
    List<String> imageUrls,
  });
}

/// @nodoc
class __$$CreatePostRequestImplCopyWithImpl<$Res>
    extends _$CreatePostRequestCopyWithImpl<$Res, _$CreatePostRequestImpl>
    implements _$$CreatePostRequestImplCopyWith<$Res> {
  __$$CreatePostRequestImplCopyWithImpl(
    _$CreatePostRequestImpl _value,
    $Res Function(_$CreatePostRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CreatePostRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? categoryId = null,
    Object? title = null,
    Object? content = null,
    Object? visibility = null,
    Object? postType = null,
    Object? imageUrls = null,
  }) {
    return _then(
      _$CreatePostRequestImpl(
        categoryId: null == categoryId
            ? _value.categoryId
            : categoryId // ignore: cast_nullable_to_non_nullable
                  as int,
        title: null == title
            ? _value.title
            : title // ignore: cast_nullable_to_non_nullable
                  as String,
        content: null == content
            ? _value.content
            : content // ignore: cast_nullable_to_non_nullable
                  as String,
        visibility: null == visibility
            ? _value.visibility
            : visibility // ignore: cast_nullable_to_non_nullable
                  as String,
        postType: null == postType
            ? _value.postType
            : postType // ignore: cast_nullable_to_non_nullable
                  as String,
        imageUrls: null == imageUrls
            ? _value._imageUrls
            : imageUrls // ignore: cast_nullable_to_non_nullable
                  as List<String>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$CreatePostRequestImpl implements _CreatePostRequest {
  const _$CreatePostRequestImpl({
    required this.categoryId,
    required this.title,
    required this.content,
    this.visibility = 'PUBLIC',
    this.postType = 'GENERAL',
    final List<String> imageUrls = const [],
  }) : _imageUrls = imageUrls;

  factory _$CreatePostRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$CreatePostRequestImplFromJson(json);

  @override
  final int categoryId;
  @override
  final String title;
  @override
  final String content;
  @override
  @JsonKey()
  final String visibility;
  @override
  @JsonKey()
  final String postType;
  final List<String> _imageUrls;
  @override
  @JsonKey()
  List<String> get imageUrls {
    if (_imageUrls is EqualUnmodifiableListView) return _imageUrls;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_imageUrls);
  }

  @override
  String toString() {
    return 'CreatePostRequest(categoryId: $categoryId, title: $title, content: $content, visibility: $visibility, postType: $postType, imageUrls: $imageUrls)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CreatePostRequestImpl &&
            (identical(other.categoryId, categoryId) ||
                other.categoryId == categoryId) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.visibility, visibility) ||
                other.visibility == visibility) &&
            (identical(other.postType, postType) ||
                other.postType == postType) &&
            const DeepCollectionEquality().equals(
              other._imageUrls,
              _imageUrls,
            ));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    categoryId,
    title,
    content,
    visibility,
    postType,
    const DeepCollectionEquality().hash(_imageUrls),
  );

  /// Create a copy of CreatePostRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CreatePostRequestImplCopyWith<_$CreatePostRequestImpl> get copyWith =>
      __$$CreatePostRequestImplCopyWithImpl<_$CreatePostRequestImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$CreatePostRequestImplToJson(this);
  }
}

abstract class _CreatePostRequest implements CreatePostRequest {
  const factory _CreatePostRequest({
    required final int categoryId,
    required final String title,
    required final String content,
    final String visibility,
    final String postType,
    final List<String> imageUrls,
  }) = _$CreatePostRequestImpl;

  factory _CreatePostRequest.fromJson(Map<String, dynamic> json) =
      _$CreatePostRequestImpl.fromJson;

  @override
  int get categoryId;
  @override
  String get title;
  @override
  String get content;
  @override
  String get visibility;
  @override
  String get postType;
  @override
  List<String> get imageUrls;

  /// Create a copy of CreatePostRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CreatePostRequestImplCopyWith<_$CreatePostRequestImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

CreateCommentRequest _$CreateCommentRequestFromJson(Map<String, dynamic> json) {
  return _CreateCommentRequest.fromJson(json);
}

/// @nodoc
mixin _$CreateCommentRequest {
  String get content => throw _privateConstructorUsedError;
  int? get parentCommentId => throw _privateConstructorUsedError;

  /// Serializes this CreateCommentRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CreateCommentRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CreateCommentRequestCopyWith<CreateCommentRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CreateCommentRequestCopyWith<$Res> {
  factory $CreateCommentRequestCopyWith(
    CreateCommentRequest value,
    $Res Function(CreateCommentRequest) then,
  ) = _$CreateCommentRequestCopyWithImpl<$Res, CreateCommentRequest>;
  @useResult
  $Res call({String content, int? parentCommentId});
}

/// @nodoc
class _$CreateCommentRequestCopyWithImpl<
  $Res,
  $Val extends CreateCommentRequest
>
    implements $CreateCommentRequestCopyWith<$Res> {
  _$CreateCommentRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CreateCommentRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? content = null, Object? parentCommentId = freezed}) {
    return _then(
      _value.copyWith(
            content: null == content
                ? _value.content
                : content // ignore: cast_nullable_to_non_nullable
                      as String,
            parentCommentId: freezed == parentCommentId
                ? _value.parentCommentId
                : parentCommentId // ignore: cast_nullable_to_non_nullable
                      as int?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CreateCommentRequestImplCopyWith<$Res>
    implements $CreateCommentRequestCopyWith<$Res> {
  factory _$$CreateCommentRequestImplCopyWith(
    _$CreateCommentRequestImpl value,
    $Res Function(_$CreateCommentRequestImpl) then,
  ) = __$$CreateCommentRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String content, int? parentCommentId});
}

/// @nodoc
class __$$CreateCommentRequestImplCopyWithImpl<$Res>
    extends _$CreateCommentRequestCopyWithImpl<$Res, _$CreateCommentRequestImpl>
    implements _$$CreateCommentRequestImplCopyWith<$Res> {
  __$$CreateCommentRequestImplCopyWithImpl(
    _$CreateCommentRequestImpl _value,
    $Res Function(_$CreateCommentRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CreateCommentRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? content = null, Object? parentCommentId = freezed}) {
    return _then(
      _$CreateCommentRequestImpl(
        content: null == content
            ? _value.content
            : content // ignore: cast_nullable_to_non_nullable
                  as String,
        parentCommentId: freezed == parentCommentId
            ? _value.parentCommentId
            : parentCommentId // ignore: cast_nullable_to_non_nullable
                  as int?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$CreateCommentRequestImpl implements _CreateCommentRequest {
  const _$CreateCommentRequestImpl({
    required this.content,
    this.parentCommentId,
  });

  factory _$CreateCommentRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$CreateCommentRequestImplFromJson(json);

  @override
  final String content;
  @override
  final int? parentCommentId;

  @override
  String toString() {
    return 'CreateCommentRequest(content: $content, parentCommentId: $parentCommentId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CreateCommentRequestImpl &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.parentCommentId, parentCommentId) ||
                other.parentCommentId == parentCommentId));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, content, parentCommentId);

  /// Create a copy of CreateCommentRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CreateCommentRequestImplCopyWith<_$CreateCommentRequestImpl>
  get copyWith =>
      __$$CreateCommentRequestImplCopyWithImpl<_$CreateCommentRequestImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$CreateCommentRequestImplToJson(this);
  }
}

abstract class _CreateCommentRequest implements CreateCommentRequest {
  const factory _CreateCommentRequest({
    required final String content,
    final int? parentCommentId,
  }) = _$CreateCommentRequestImpl;

  factory _CreateCommentRequest.fromJson(Map<String, dynamic> json) =
      _$CreateCommentRequestImpl.fromJson;

  @override
  String get content;
  @override
  int? get parentCommentId;

  /// Create a copy of CreateCommentRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CreateCommentRequestImplCopyWith<_$CreateCommentRequestImpl>
  get copyWith => throw _privateConstructorUsedError;
}
