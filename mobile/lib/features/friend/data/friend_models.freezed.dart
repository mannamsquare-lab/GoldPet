// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'friend_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

FriendLocationModel _$FriendLocationModelFromJson(Map<String, dynamic> json) {
  return _FriendLocationModel.fromJson(json);
}

/// @nodoc
mixin _$FriendLocationModel {
  int get id => throw _privateConstructorUsedError;
  String? get nickname => throw _privateConstructorUsedError;
  String? get profileImageUrl => throw _privateConstructorUsedError;
  double? get latitude => throw _privateConstructorUsedError;
  double? get longitude => throw _privateConstructorUsedError;

  /// Serializes this FriendLocationModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of FriendLocationModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $FriendLocationModelCopyWith<FriendLocationModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $FriendLocationModelCopyWith<$Res> {
  factory $FriendLocationModelCopyWith(
    FriendLocationModel value,
    $Res Function(FriendLocationModel) then,
  ) = _$FriendLocationModelCopyWithImpl<$Res, FriendLocationModel>;
  @useResult
  $Res call({
    int id,
    String? nickname,
    String? profileImageUrl,
    double? latitude,
    double? longitude,
  });
}

/// @nodoc
class _$FriendLocationModelCopyWithImpl<$Res, $Val extends FriendLocationModel>
    implements $FriendLocationModelCopyWith<$Res> {
  _$FriendLocationModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of FriendLocationModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? nickname = freezed,
    Object? profileImageUrl = freezed,
    Object? latitude = freezed,
    Object? longitude = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            nickname: freezed == nickname
                ? _value.nickname
                : nickname // ignore: cast_nullable_to_non_nullable
                      as String?,
            profileImageUrl: freezed == profileImageUrl
                ? _value.profileImageUrl
                : profileImageUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
            latitude: freezed == latitude
                ? _value.latitude
                : latitude // ignore: cast_nullable_to_non_nullable
                      as double?,
            longitude: freezed == longitude
                ? _value.longitude
                : longitude // ignore: cast_nullable_to_non_nullable
                      as double?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$FriendLocationModelImplCopyWith<$Res>
    implements $FriendLocationModelCopyWith<$Res> {
  factory _$$FriendLocationModelImplCopyWith(
    _$FriendLocationModelImpl value,
    $Res Function(_$FriendLocationModelImpl) then,
  ) = __$$FriendLocationModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    String? nickname,
    String? profileImageUrl,
    double? latitude,
    double? longitude,
  });
}

/// @nodoc
class __$$FriendLocationModelImplCopyWithImpl<$Res>
    extends _$FriendLocationModelCopyWithImpl<$Res, _$FriendLocationModelImpl>
    implements _$$FriendLocationModelImplCopyWith<$Res> {
  __$$FriendLocationModelImplCopyWithImpl(
    _$FriendLocationModelImpl _value,
    $Res Function(_$FriendLocationModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of FriendLocationModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? nickname = freezed,
    Object? profileImageUrl = freezed,
    Object? latitude = freezed,
    Object? longitude = freezed,
  }) {
    return _then(
      _$FriendLocationModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        nickname: freezed == nickname
            ? _value.nickname
            : nickname // ignore: cast_nullable_to_non_nullable
                  as String?,
        profileImageUrl: freezed == profileImageUrl
            ? _value.profileImageUrl
            : profileImageUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
        latitude: freezed == latitude
            ? _value.latitude
            : latitude // ignore: cast_nullable_to_non_nullable
                  as double?,
        longitude: freezed == longitude
            ? _value.longitude
            : longitude // ignore: cast_nullable_to_non_nullable
                  as double?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$FriendLocationModelImpl implements _FriendLocationModel {
  const _$FriendLocationModelImpl({
    required this.id,
    this.nickname,
    this.profileImageUrl,
    this.latitude,
    this.longitude,
  });

  factory _$FriendLocationModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$FriendLocationModelImplFromJson(json);

  @override
  final int id;
  @override
  final String? nickname;
  @override
  final String? profileImageUrl;
  @override
  final double? latitude;
  @override
  final double? longitude;

  @override
  String toString() {
    return 'FriendLocationModel(id: $id, nickname: $nickname, profileImageUrl: $profileImageUrl, latitude: $latitude, longitude: $longitude)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$FriendLocationModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.nickname, nickname) ||
                other.nickname == nickname) &&
            (identical(other.profileImageUrl, profileImageUrl) ||
                other.profileImageUrl == profileImageUrl) &&
            (identical(other.latitude, latitude) ||
                other.latitude == latitude) &&
            (identical(other.longitude, longitude) ||
                other.longitude == longitude));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    nickname,
    profileImageUrl,
    latitude,
    longitude,
  );

  /// Create a copy of FriendLocationModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$FriendLocationModelImplCopyWith<_$FriendLocationModelImpl> get copyWith =>
      __$$FriendLocationModelImplCopyWithImpl<_$FriendLocationModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$FriendLocationModelImplToJson(this);
  }
}

abstract class _FriendLocationModel implements FriendLocationModel {
  const factory _FriendLocationModel({
    required final int id,
    final String? nickname,
    final String? profileImageUrl,
    final double? latitude,
    final double? longitude,
  }) = _$FriendLocationModelImpl;

  factory _FriendLocationModel.fromJson(Map<String, dynamic> json) =
      _$FriendLocationModelImpl.fromJson;

  @override
  int get id;
  @override
  String? get nickname;
  @override
  String? get profileImageUrl;
  @override
  double? get latitude;
  @override
  double? get longitude;

  /// Create a copy of FriendLocationModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$FriendLocationModelImplCopyWith<_$FriendLocationModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

MatchModel _$MatchModelFromJson(Map<String, dynamic> json) {
  return _MatchModel.fromJson(json);
}

/// @nodoc
mixin _$MatchModel {
  int get matchId => throw _privateConstructorUsedError;
  int get partnerId => throw _privateConstructorUsedError;
  String? get partnerNickname => throw _privateConstructorUsedError;
  String? get partnerProfileImage => throw _privateConstructorUsedError;
  String? get matchedAt => throw _privateConstructorUsedError;

  /// Serializes this MatchModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of MatchModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $MatchModelCopyWith<MatchModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $MatchModelCopyWith<$Res> {
  factory $MatchModelCopyWith(
    MatchModel value,
    $Res Function(MatchModel) then,
  ) = _$MatchModelCopyWithImpl<$Res, MatchModel>;
  @useResult
  $Res call({
    int matchId,
    int partnerId,
    String? partnerNickname,
    String? partnerProfileImage,
    String? matchedAt,
  });
}

/// @nodoc
class _$MatchModelCopyWithImpl<$Res, $Val extends MatchModel>
    implements $MatchModelCopyWith<$Res> {
  _$MatchModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of MatchModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? matchId = null,
    Object? partnerId = null,
    Object? partnerNickname = freezed,
    Object? partnerProfileImage = freezed,
    Object? matchedAt = freezed,
  }) {
    return _then(
      _value.copyWith(
            matchId: null == matchId
                ? _value.matchId
                : matchId // ignore: cast_nullable_to_non_nullable
                      as int,
            partnerId: null == partnerId
                ? _value.partnerId
                : partnerId // ignore: cast_nullable_to_non_nullable
                      as int,
            partnerNickname: freezed == partnerNickname
                ? _value.partnerNickname
                : partnerNickname // ignore: cast_nullable_to_non_nullable
                      as String?,
            partnerProfileImage: freezed == partnerProfileImage
                ? _value.partnerProfileImage
                : partnerProfileImage // ignore: cast_nullable_to_non_nullable
                      as String?,
            matchedAt: freezed == matchedAt
                ? _value.matchedAt
                : matchedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$MatchModelImplCopyWith<$Res>
    implements $MatchModelCopyWith<$Res> {
  factory _$$MatchModelImplCopyWith(
    _$MatchModelImpl value,
    $Res Function(_$MatchModelImpl) then,
  ) = __$$MatchModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int matchId,
    int partnerId,
    String? partnerNickname,
    String? partnerProfileImage,
    String? matchedAt,
  });
}

/// @nodoc
class __$$MatchModelImplCopyWithImpl<$Res>
    extends _$MatchModelCopyWithImpl<$Res, _$MatchModelImpl>
    implements _$$MatchModelImplCopyWith<$Res> {
  __$$MatchModelImplCopyWithImpl(
    _$MatchModelImpl _value,
    $Res Function(_$MatchModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of MatchModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? matchId = null,
    Object? partnerId = null,
    Object? partnerNickname = freezed,
    Object? partnerProfileImage = freezed,
    Object? matchedAt = freezed,
  }) {
    return _then(
      _$MatchModelImpl(
        matchId: null == matchId
            ? _value.matchId
            : matchId // ignore: cast_nullable_to_non_nullable
                  as int,
        partnerId: null == partnerId
            ? _value.partnerId
            : partnerId // ignore: cast_nullable_to_non_nullable
                  as int,
        partnerNickname: freezed == partnerNickname
            ? _value.partnerNickname
            : partnerNickname // ignore: cast_nullable_to_non_nullable
                  as String?,
        partnerProfileImage: freezed == partnerProfileImage
            ? _value.partnerProfileImage
            : partnerProfileImage // ignore: cast_nullable_to_non_nullable
                  as String?,
        matchedAt: freezed == matchedAt
            ? _value.matchedAt
            : matchedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$MatchModelImpl implements _MatchModel {
  const _$MatchModelImpl({
    required this.matchId,
    required this.partnerId,
    this.partnerNickname,
    this.partnerProfileImage,
    this.matchedAt,
  });

  factory _$MatchModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$MatchModelImplFromJson(json);

  @override
  final int matchId;
  @override
  final int partnerId;
  @override
  final String? partnerNickname;
  @override
  final String? partnerProfileImage;
  @override
  final String? matchedAt;

  @override
  String toString() {
    return 'MatchModel(matchId: $matchId, partnerId: $partnerId, partnerNickname: $partnerNickname, partnerProfileImage: $partnerProfileImage, matchedAt: $matchedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$MatchModelImpl &&
            (identical(other.matchId, matchId) || other.matchId == matchId) &&
            (identical(other.partnerId, partnerId) ||
                other.partnerId == partnerId) &&
            (identical(other.partnerNickname, partnerNickname) ||
                other.partnerNickname == partnerNickname) &&
            (identical(other.partnerProfileImage, partnerProfileImage) ||
                other.partnerProfileImage == partnerProfileImage) &&
            (identical(other.matchedAt, matchedAt) ||
                other.matchedAt == matchedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    matchId,
    partnerId,
    partnerNickname,
    partnerProfileImage,
    matchedAt,
  );

  /// Create a copy of MatchModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$MatchModelImplCopyWith<_$MatchModelImpl> get copyWith =>
      __$$MatchModelImplCopyWithImpl<_$MatchModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$MatchModelImplToJson(this);
  }
}

abstract class _MatchModel implements MatchModel {
  const factory _MatchModel({
    required final int matchId,
    required final int partnerId,
    final String? partnerNickname,
    final String? partnerProfileImage,
    final String? matchedAt,
  }) = _$MatchModelImpl;

  factory _MatchModel.fromJson(Map<String, dynamic> json) =
      _$MatchModelImpl.fromJson;

  @override
  int get matchId;
  @override
  int get partnerId;
  @override
  String? get partnerNickname;
  @override
  String? get partnerProfileImage;
  @override
  String? get matchedAt;

  /// Create a copy of MatchModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$MatchModelImplCopyWith<_$MatchModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

LikeRequest _$LikeRequestFromJson(Map<String, dynamic> json) {
  return _LikeRequest.fromJson(json);
}

/// @nodoc
mixin _$LikeRequest {
  int get toUserId => throw _privateConstructorUsedError;

  /// Serializes this LikeRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of LikeRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $LikeRequestCopyWith<LikeRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LikeRequestCopyWith<$Res> {
  factory $LikeRequestCopyWith(
    LikeRequest value,
    $Res Function(LikeRequest) then,
  ) = _$LikeRequestCopyWithImpl<$Res, LikeRequest>;
  @useResult
  $Res call({int toUserId});
}

/// @nodoc
class _$LikeRequestCopyWithImpl<$Res, $Val extends LikeRequest>
    implements $LikeRequestCopyWith<$Res> {
  _$LikeRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of LikeRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? toUserId = null}) {
    return _then(
      _value.copyWith(
            toUserId: null == toUserId
                ? _value.toUserId
                : toUserId // ignore: cast_nullable_to_non_nullable
                      as int,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$LikeRequestImplCopyWith<$Res>
    implements $LikeRequestCopyWith<$Res> {
  factory _$$LikeRequestImplCopyWith(
    _$LikeRequestImpl value,
    $Res Function(_$LikeRequestImpl) then,
  ) = __$$LikeRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int toUserId});
}

/// @nodoc
class __$$LikeRequestImplCopyWithImpl<$Res>
    extends _$LikeRequestCopyWithImpl<$Res, _$LikeRequestImpl>
    implements _$$LikeRequestImplCopyWith<$Res> {
  __$$LikeRequestImplCopyWithImpl(
    _$LikeRequestImpl _value,
    $Res Function(_$LikeRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of LikeRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? toUserId = null}) {
    return _then(
      _$LikeRequestImpl(
        toUserId: null == toUserId
            ? _value.toUserId
            : toUserId // ignore: cast_nullable_to_non_nullable
                  as int,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$LikeRequestImpl implements _LikeRequest {
  const _$LikeRequestImpl({required this.toUserId});

  factory _$LikeRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$LikeRequestImplFromJson(json);

  @override
  final int toUserId;

  @override
  String toString() {
    return 'LikeRequest(toUserId: $toUserId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LikeRequestImpl &&
            (identical(other.toUserId, toUserId) ||
                other.toUserId == toUserId));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, toUserId);

  /// Create a copy of LikeRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$LikeRequestImplCopyWith<_$LikeRequestImpl> get copyWith =>
      __$$LikeRequestImplCopyWithImpl<_$LikeRequestImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$LikeRequestImplToJson(this);
  }
}

abstract class _LikeRequest implements LikeRequest {
  const factory _LikeRequest({required final int toUserId}) = _$LikeRequestImpl;

  factory _LikeRequest.fromJson(Map<String, dynamic> json) =
      _$LikeRequestImpl.fromJson;

  @override
  int get toUserId;

  /// Create a copy of LikeRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LikeRequestImplCopyWith<_$LikeRequestImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

BlockRequest _$BlockRequestFromJson(Map<String, dynamic> json) {
  return _BlockRequest.fromJson(json);
}

/// @nodoc
mixin _$BlockRequest {
  int get blockedUserId => throw _privateConstructorUsedError;

  /// Serializes this BlockRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of BlockRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $BlockRequestCopyWith<BlockRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $BlockRequestCopyWith<$Res> {
  factory $BlockRequestCopyWith(
    BlockRequest value,
    $Res Function(BlockRequest) then,
  ) = _$BlockRequestCopyWithImpl<$Res, BlockRequest>;
  @useResult
  $Res call({int blockedUserId});
}

/// @nodoc
class _$BlockRequestCopyWithImpl<$Res, $Val extends BlockRequest>
    implements $BlockRequestCopyWith<$Res> {
  _$BlockRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of BlockRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? blockedUserId = null}) {
    return _then(
      _value.copyWith(
            blockedUserId: null == blockedUserId
                ? _value.blockedUserId
                : blockedUserId // ignore: cast_nullable_to_non_nullable
                      as int,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$BlockRequestImplCopyWith<$Res>
    implements $BlockRequestCopyWith<$Res> {
  factory _$$BlockRequestImplCopyWith(
    _$BlockRequestImpl value,
    $Res Function(_$BlockRequestImpl) then,
  ) = __$$BlockRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int blockedUserId});
}

/// @nodoc
class __$$BlockRequestImplCopyWithImpl<$Res>
    extends _$BlockRequestCopyWithImpl<$Res, _$BlockRequestImpl>
    implements _$$BlockRequestImplCopyWith<$Res> {
  __$$BlockRequestImplCopyWithImpl(
    _$BlockRequestImpl _value,
    $Res Function(_$BlockRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of BlockRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? blockedUserId = null}) {
    return _then(
      _$BlockRequestImpl(
        blockedUserId: null == blockedUserId
            ? _value.blockedUserId
            : blockedUserId // ignore: cast_nullable_to_non_nullable
                  as int,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$BlockRequestImpl implements _BlockRequest {
  const _$BlockRequestImpl({required this.blockedUserId});

  factory _$BlockRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$BlockRequestImplFromJson(json);

  @override
  final int blockedUserId;

  @override
  String toString() {
    return 'BlockRequest(blockedUserId: $blockedUserId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$BlockRequestImpl &&
            (identical(other.blockedUserId, blockedUserId) ||
                other.blockedUserId == blockedUserId));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, blockedUserId);

  /// Create a copy of BlockRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$BlockRequestImplCopyWith<_$BlockRequestImpl> get copyWith =>
      __$$BlockRequestImplCopyWithImpl<_$BlockRequestImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$BlockRequestImplToJson(this);
  }
}

abstract class _BlockRequest implements BlockRequest {
  const factory _BlockRequest({required final int blockedUserId}) =
      _$BlockRequestImpl;

  factory _BlockRequest.fromJson(Map<String, dynamic> json) =
      _$BlockRequestImpl.fromJson;

  @override
  int get blockedUserId;

  /// Create a copy of BlockRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$BlockRequestImplCopyWith<_$BlockRequestImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
