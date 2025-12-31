// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'checkin_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

PlaceResponse _$PlaceResponseFromJson(Map<String, dynamic> json) {
  return _PlaceResponse.fromJson(json);
}

/// @nodoc
mixin _$PlaceResponse {
  int get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  PlaceCategory get category => throw _privateConstructorUsedError;
  String? get address => throw _privateConstructorUsedError;
  double get latitude => throw _privateConstructorUsedError;
  double get longitude => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;
  String? get imageUrl => throw _privateConstructorUsedError;
  bool get isVerified => throw _privateConstructorUsedError;
  int get checkinCount => throw _privateConstructorUsedError;

  /// Serializes this PlaceResponse to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of PlaceResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $PlaceResponseCopyWith<PlaceResponse> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PlaceResponseCopyWith<$Res> {
  factory $PlaceResponseCopyWith(
    PlaceResponse value,
    $Res Function(PlaceResponse) then,
  ) = _$PlaceResponseCopyWithImpl<$Res, PlaceResponse>;
  @useResult
  $Res call({
    int id,
    String name,
    PlaceCategory category,
    String? address,
    double latitude,
    double longitude,
    String? description,
    String? imageUrl,
    bool isVerified,
    int checkinCount,
  });
}

/// @nodoc
class _$PlaceResponseCopyWithImpl<$Res, $Val extends PlaceResponse>
    implements $PlaceResponseCopyWith<$Res> {
  _$PlaceResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of PlaceResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? category = null,
    Object? address = freezed,
    Object? latitude = null,
    Object? longitude = null,
    Object? description = freezed,
    Object? imageUrl = freezed,
    Object? isVerified = null,
    Object? checkinCount = null,
  }) {
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
            category: null == category
                ? _value.category
                : category // ignore: cast_nullable_to_non_nullable
                      as PlaceCategory,
            address: freezed == address
                ? _value.address
                : address // ignore: cast_nullable_to_non_nullable
                      as String?,
            latitude: null == latitude
                ? _value.latitude
                : latitude // ignore: cast_nullable_to_non_nullable
                      as double,
            longitude: null == longitude
                ? _value.longitude
                : longitude // ignore: cast_nullable_to_non_nullable
                      as double,
            description: freezed == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String?,
            imageUrl: freezed == imageUrl
                ? _value.imageUrl
                : imageUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
            isVerified: null == isVerified
                ? _value.isVerified
                : isVerified // ignore: cast_nullable_to_non_nullable
                      as bool,
            checkinCount: null == checkinCount
                ? _value.checkinCount
                : checkinCount // ignore: cast_nullable_to_non_nullable
                      as int,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$PlaceResponseImplCopyWith<$Res>
    implements $PlaceResponseCopyWith<$Res> {
  factory _$$PlaceResponseImplCopyWith(
    _$PlaceResponseImpl value,
    $Res Function(_$PlaceResponseImpl) then,
  ) = __$$PlaceResponseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    String name,
    PlaceCategory category,
    String? address,
    double latitude,
    double longitude,
    String? description,
    String? imageUrl,
    bool isVerified,
    int checkinCount,
  });
}

/// @nodoc
class __$$PlaceResponseImplCopyWithImpl<$Res>
    extends _$PlaceResponseCopyWithImpl<$Res, _$PlaceResponseImpl>
    implements _$$PlaceResponseImplCopyWith<$Res> {
  __$$PlaceResponseImplCopyWithImpl(
    _$PlaceResponseImpl _value,
    $Res Function(_$PlaceResponseImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of PlaceResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? category = null,
    Object? address = freezed,
    Object? latitude = null,
    Object? longitude = null,
    Object? description = freezed,
    Object? imageUrl = freezed,
    Object? isVerified = null,
    Object? checkinCount = null,
  }) {
    return _then(
      _$PlaceResponseImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        category: null == category
            ? _value.category
            : category // ignore: cast_nullable_to_non_nullable
                  as PlaceCategory,
        address: freezed == address
            ? _value.address
            : address // ignore: cast_nullable_to_non_nullable
                  as String?,
        latitude: null == latitude
            ? _value.latitude
            : latitude // ignore: cast_nullable_to_non_nullable
                  as double,
        longitude: null == longitude
            ? _value.longitude
            : longitude // ignore: cast_nullable_to_non_nullable
                  as double,
        description: freezed == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String?,
        imageUrl: freezed == imageUrl
            ? _value.imageUrl
            : imageUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
        isVerified: null == isVerified
            ? _value.isVerified
            : isVerified // ignore: cast_nullable_to_non_nullable
                  as bool,
        checkinCount: null == checkinCount
            ? _value.checkinCount
            : checkinCount // ignore: cast_nullable_to_non_nullable
                  as int,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$PlaceResponseImpl implements _PlaceResponse {
  const _$PlaceResponseImpl({
    required this.id,
    required this.name,
    required this.category,
    this.address,
    required this.latitude,
    required this.longitude,
    this.description,
    this.imageUrl,
    required this.isVerified,
    required this.checkinCount,
  });

  factory _$PlaceResponseImpl.fromJson(Map<String, dynamic> json) =>
      _$$PlaceResponseImplFromJson(json);

  @override
  final int id;
  @override
  final String name;
  @override
  final PlaceCategory category;
  @override
  final String? address;
  @override
  final double latitude;
  @override
  final double longitude;
  @override
  final String? description;
  @override
  final String? imageUrl;
  @override
  final bool isVerified;
  @override
  final int checkinCount;

  @override
  String toString() {
    return 'PlaceResponse(id: $id, name: $name, category: $category, address: $address, latitude: $latitude, longitude: $longitude, description: $description, imageUrl: $imageUrl, isVerified: $isVerified, checkinCount: $checkinCount)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PlaceResponseImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.address, address) || other.address == address) &&
            (identical(other.latitude, latitude) ||
                other.latitude == latitude) &&
            (identical(other.longitude, longitude) ||
                other.longitude == longitude) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.imageUrl, imageUrl) ||
                other.imageUrl == imageUrl) &&
            (identical(other.isVerified, isVerified) ||
                other.isVerified == isVerified) &&
            (identical(other.checkinCount, checkinCount) ||
                other.checkinCount == checkinCount));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    name,
    category,
    address,
    latitude,
    longitude,
    description,
    imageUrl,
    isVerified,
    checkinCount,
  );

  /// Create a copy of PlaceResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$PlaceResponseImplCopyWith<_$PlaceResponseImpl> get copyWith =>
      __$$PlaceResponseImplCopyWithImpl<_$PlaceResponseImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$PlaceResponseImplToJson(this);
  }
}

abstract class _PlaceResponse implements PlaceResponse {
  const factory _PlaceResponse({
    required final int id,
    required final String name,
    required final PlaceCategory category,
    final String? address,
    required final double latitude,
    required final double longitude,
    final String? description,
    final String? imageUrl,
    required final bool isVerified,
    required final int checkinCount,
  }) = _$PlaceResponseImpl;

  factory _PlaceResponse.fromJson(Map<String, dynamic> json) =
      _$PlaceResponseImpl.fromJson;

  @override
  int get id;
  @override
  String get name;
  @override
  PlaceCategory get category;
  @override
  String? get address;
  @override
  double get latitude;
  @override
  double get longitude;
  @override
  String? get description;
  @override
  String? get imageUrl;
  @override
  bool get isVerified;
  @override
  int get checkinCount;

  /// Create a copy of PlaceResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$PlaceResponseImplCopyWith<_$PlaceResponseImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

CheckInResponse _$CheckInResponseFromJson(Map<String, dynamic> json) {
  return _CheckInResponse.fromJson(json);
}

/// @nodoc
mixin _$CheckInResponse {
  int get id => throw _privateConstructorUsedError;
  int get userId => throw _privateConstructorUsedError;
  String? get userNickname => throw _privateConstructorUsedError;
  String? get userProfileImage => throw _privateConstructorUsedError;
  int get placeId => throw _privateConstructorUsedError;
  String get placeName => throw _privateConstructorUsedError;
  String? get photoUrl => throw _privateConstructorUsedError;
  String? get memo => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;

  /// Serializes this CheckInResponse to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CheckInResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CheckInResponseCopyWith<CheckInResponse> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CheckInResponseCopyWith<$Res> {
  factory $CheckInResponseCopyWith(
    CheckInResponse value,
    $Res Function(CheckInResponse) then,
  ) = _$CheckInResponseCopyWithImpl<$Res, CheckInResponse>;
  @useResult
  $Res call({
    int id,
    int userId,
    String? userNickname,
    String? userProfileImage,
    int placeId,
    String placeName,
    String? photoUrl,
    String? memo,
    DateTime? createdAt,
  });
}

/// @nodoc
class _$CheckInResponseCopyWithImpl<$Res, $Val extends CheckInResponse>
    implements $CheckInResponseCopyWith<$Res> {
  _$CheckInResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CheckInResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? userNickname = freezed,
    Object? userProfileImage = freezed,
    Object? placeId = null,
    Object? placeName = null,
    Object? photoUrl = freezed,
    Object? memo = freezed,
    Object? createdAt = freezed,
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
            placeId: null == placeId
                ? _value.placeId
                : placeId // ignore: cast_nullable_to_non_nullable
                      as int,
            placeName: null == placeName
                ? _value.placeName
                : placeName // ignore: cast_nullable_to_non_nullable
                      as String,
            photoUrl: freezed == photoUrl
                ? _value.photoUrl
                : photoUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
            memo: freezed == memo
                ? _value.memo
                : memo // ignore: cast_nullable_to_non_nullable
                      as String?,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CheckInResponseImplCopyWith<$Res>
    implements $CheckInResponseCopyWith<$Res> {
  factory _$$CheckInResponseImplCopyWith(
    _$CheckInResponseImpl value,
    $Res Function(_$CheckInResponseImpl) then,
  ) = __$$CheckInResponseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    int userId,
    String? userNickname,
    String? userProfileImage,
    int placeId,
    String placeName,
    String? photoUrl,
    String? memo,
    DateTime? createdAt,
  });
}

/// @nodoc
class __$$CheckInResponseImplCopyWithImpl<$Res>
    extends _$CheckInResponseCopyWithImpl<$Res, _$CheckInResponseImpl>
    implements _$$CheckInResponseImplCopyWith<$Res> {
  __$$CheckInResponseImplCopyWithImpl(
    _$CheckInResponseImpl _value,
    $Res Function(_$CheckInResponseImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CheckInResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? userNickname = freezed,
    Object? userProfileImage = freezed,
    Object? placeId = null,
    Object? placeName = null,
    Object? photoUrl = freezed,
    Object? memo = freezed,
    Object? createdAt = freezed,
  }) {
    return _then(
      _$CheckInResponseImpl(
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
        placeId: null == placeId
            ? _value.placeId
            : placeId // ignore: cast_nullable_to_non_nullable
                  as int,
        placeName: null == placeName
            ? _value.placeName
            : placeName // ignore: cast_nullable_to_non_nullable
                  as String,
        photoUrl: freezed == photoUrl
            ? _value.photoUrl
            : photoUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
        memo: freezed == memo
            ? _value.memo
            : memo // ignore: cast_nullable_to_non_nullable
                  as String?,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$CheckInResponseImpl implements _CheckInResponse {
  const _$CheckInResponseImpl({
    required this.id,
    required this.userId,
    this.userNickname,
    this.userProfileImage,
    required this.placeId,
    required this.placeName,
    this.photoUrl,
    this.memo,
    this.createdAt,
  });

  factory _$CheckInResponseImpl.fromJson(Map<String, dynamic> json) =>
      _$$CheckInResponseImplFromJson(json);

  @override
  final int id;
  @override
  final int userId;
  @override
  final String? userNickname;
  @override
  final String? userProfileImage;
  @override
  final int placeId;
  @override
  final String placeName;
  @override
  final String? photoUrl;
  @override
  final String? memo;
  @override
  final DateTime? createdAt;

  @override
  String toString() {
    return 'CheckInResponse(id: $id, userId: $userId, userNickname: $userNickname, userProfileImage: $userProfileImage, placeId: $placeId, placeName: $placeName, photoUrl: $photoUrl, memo: $memo, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CheckInResponseImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.userNickname, userNickname) ||
                other.userNickname == userNickname) &&
            (identical(other.userProfileImage, userProfileImage) ||
                other.userProfileImage == userProfileImage) &&
            (identical(other.placeId, placeId) || other.placeId == placeId) &&
            (identical(other.placeName, placeName) ||
                other.placeName == placeName) &&
            (identical(other.photoUrl, photoUrl) ||
                other.photoUrl == photoUrl) &&
            (identical(other.memo, memo) || other.memo == memo) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    userId,
    userNickname,
    userProfileImage,
    placeId,
    placeName,
    photoUrl,
    memo,
    createdAt,
  );

  /// Create a copy of CheckInResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CheckInResponseImplCopyWith<_$CheckInResponseImpl> get copyWith =>
      __$$CheckInResponseImplCopyWithImpl<_$CheckInResponseImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$CheckInResponseImplToJson(this);
  }
}

abstract class _CheckInResponse implements CheckInResponse {
  const factory _CheckInResponse({
    required final int id,
    required final int userId,
    final String? userNickname,
    final String? userProfileImage,
    required final int placeId,
    required final String placeName,
    final String? photoUrl,
    final String? memo,
    final DateTime? createdAt,
  }) = _$CheckInResponseImpl;

  factory _CheckInResponse.fromJson(Map<String, dynamic> json) =
      _$CheckInResponseImpl.fromJson;

  @override
  int get id;
  @override
  int get userId;
  @override
  String? get userNickname;
  @override
  String? get userProfileImage;
  @override
  int get placeId;
  @override
  String get placeName;
  @override
  String? get photoUrl;
  @override
  String? get memo;
  @override
  DateTime? get createdAt;

  /// Create a copy of CheckInResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CheckInResponseImplCopyWith<_$CheckInResponseImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

CreateCheckInRequest _$CreateCheckInRequestFromJson(Map<String, dynamic> json) {
  return _CreateCheckInRequest.fromJson(json);
}

/// @nodoc
mixin _$CreateCheckInRequest {
  int get placeId => throw _privateConstructorUsedError;
  String? get photoUrl => throw _privateConstructorUsedError;
  String? get memo => throw _privateConstructorUsedError;

  /// Serializes this CreateCheckInRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CreateCheckInRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CreateCheckInRequestCopyWith<CreateCheckInRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CreateCheckInRequestCopyWith<$Res> {
  factory $CreateCheckInRequestCopyWith(
    CreateCheckInRequest value,
    $Res Function(CreateCheckInRequest) then,
  ) = _$CreateCheckInRequestCopyWithImpl<$Res, CreateCheckInRequest>;
  @useResult
  $Res call({int placeId, String? photoUrl, String? memo});
}

/// @nodoc
class _$CreateCheckInRequestCopyWithImpl<
  $Res,
  $Val extends CreateCheckInRequest
>
    implements $CreateCheckInRequestCopyWith<$Res> {
  _$CreateCheckInRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CreateCheckInRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? placeId = null,
    Object? photoUrl = freezed,
    Object? memo = freezed,
  }) {
    return _then(
      _value.copyWith(
            placeId: null == placeId
                ? _value.placeId
                : placeId // ignore: cast_nullable_to_non_nullable
                      as int,
            photoUrl: freezed == photoUrl
                ? _value.photoUrl
                : photoUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
            memo: freezed == memo
                ? _value.memo
                : memo // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CreateCheckInRequestImplCopyWith<$Res>
    implements $CreateCheckInRequestCopyWith<$Res> {
  factory _$$CreateCheckInRequestImplCopyWith(
    _$CreateCheckInRequestImpl value,
    $Res Function(_$CreateCheckInRequestImpl) then,
  ) = __$$CreateCheckInRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int placeId, String? photoUrl, String? memo});
}

/// @nodoc
class __$$CreateCheckInRequestImplCopyWithImpl<$Res>
    extends _$CreateCheckInRequestCopyWithImpl<$Res, _$CreateCheckInRequestImpl>
    implements _$$CreateCheckInRequestImplCopyWith<$Res> {
  __$$CreateCheckInRequestImplCopyWithImpl(
    _$CreateCheckInRequestImpl _value,
    $Res Function(_$CreateCheckInRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CreateCheckInRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? placeId = null,
    Object? photoUrl = freezed,
    Object? memo = freezed,
  }) {
    return _then(
      _$CreateCheckInRequestImpl(
        placeId: null == placeId
            ? _value.placeId
            : placeId // ignore: cast_nullable_to_non_nullable
                  as int,
        photoUrl: freezed == photoUrl
            ? _value.photoUrl
            : photoUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
        memo: freezed == memo
            ? _value.memo
            : memo // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$CreateCheckInRequestImpl implements _CreateCheckInRequest {
  const _$CreateCheckInRequestImpl({
    required this.placeId,
    this.photoUrl,
    this.memo,
  });

  factory _$CreateCheckInRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$CreateCheckInRequestImplFromJson(json);

  @override
  final int placeId;
  @override
  final String? photoUrl;
  @override
  final String? memo;

  @override
  String toString() {
    return 'CreateCheckInRequest(placeId: $placeId, photoUrl: $photoUrl, memo: $memo)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CreateCheckInRequestImpl &&
            (identical(other.placeId, placeId) || other.placeId == placeId) &&
            (identical(other.photoUrl, photoUrl) ||
                other.photoUrl == photoUrl) &&
            (identical(other.memo, memo) || other.memo == memo));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, placeId, photoUrl, memo);

  /// Create a copy of CreateCheckInRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CreateCheckInRequestImplCopyWith<_$CreateCheckInRequestImpl>
  get copyWith =>
      __$$CreateCheckInRequestImplCopyWithImpl<_$CreateCheckInRequestImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$CreateCheckInRequestImplToJson(this);
  }
}

abstract class _CreateCheckInRequest implements CreateCheckInRequest {
  const factory _CreateCheckInRequest({
    required final int placeId,
    final String? photoUrl,
    final String? memo,
  }) = _$CreateCheckInRequestImpl;

  factory _CreateCheckInRequest.fromJson(Map<String, dynamic> json) =
      _$CreateCheckInRequestImpl.fromJson;

  @override
  int get placeId;
  @override
  String? get photoUrl;
  @override
  String? get memo;

  /// Create a copy of CreateCheckInRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CreateCheckInRequestImplCopyWith<_$CreateCheckInRequestImpl>
  get copyWith => throw _privateConstructorUsedError;
}

NearbyPlaceRequest _$NearbyPlaceRequestFromJson(Map<String, dynamic> json) {
  return _NearbyPlaceRequest.fromJson(json);
}

/// @nodoc
mixin _$NearbyPlaceRequest {
  double get latitude => throw _privateConstructorUsedError;
  double get longitude => throw _privateConstructorUsedError;
  double get radiusMeters => throw _privateConstructorUsedError;

  /// Serializes this NearbyPlaceRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of NearbyPlaceRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $NearbyPlaceRequestCopyWith<NearbyPlaceRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $NearbyPlaceRequestCopyWith<$Res> {
  factory $NearbyPlaceRequestCopyWith(
    NearbyPlaceRequest value,
    $Res Function(NearbyPlaceRequest) then,
  ) = _$NearbyPlaceRequestCopyWithImpl<$Res, NearbyPlaceRequest>;
  @useResult
  $Res call({double latitude, double longitude, double radiusMeters});
}

/// @nodoc
class _$NearbyPlaceRequestCopyWithImpl<$Res, $Val extends NearbyPlaceRequest>
    implements $NearbyPlaceRequestCopyWith<$Res> {
  _$NearbyPlaceRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of NearbyPlaceRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? latitude = null,
    Object? longitude = null,
    Object? radiusMeters = null,
  }) {
    return _then(
      _value.copyWith(
            latitude: null == latitude
                ? _value.latitude
                : latitude // ignore: cast_nullable_to_non_nullable
                      as double,
            longitude: null == longitude
                ? _value.longitude
                : longitude // ignore: cast_nullable_to_non_nullable
                      as double,
            radiusMeters: null == radiusMeters
                ? _value.radiusMeters
                : radiusMeters // ignore: cast_nullable_to_non_nullable
                      as double,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$NearbyPlaceRequestImplCopyWith<$Res>
    implements $NearbyPlaceRequestCopyWith<$Res> {
  factory _$$NearbyPlaceRequestImplCopyWith(
    _$NearbyPlaceRequestImpl value,
    $Res Function(_$NearbyPlaceRequestImpl) then,
  ) = __$$NearbyPlaceRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({double latitude, double longitude, double radiusMeters});
}

/// @nodoc
class __$$NearbyPlaceRequestImplCopyWithImpl<$Res>
    extends _$NearbyPlaceRequestCopyWithImpl<$Res, _$NearbyPlaceRequestImpl>
    implements _$$NearbyPlaceRequestImplCopyWith<$Res> {
  __$$NearbyPlaceRequestImplCopyWithImpl(
    _$NearbyPlaceRequestImpl _value,
    $Res Function(_$NearbyPlaceRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of NearbyPlaceRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? latitude = null,
    Object? longitude = null,
    Object? radiusMeters = null,
  }) {
    return _then(
      _$NearbyPlaceRequestImpl(
        latitude: null == latitude
            ? _value.latitude
            : latitude // ignore: cast_nullable_to_non_nullable
                  as double,
        longitude: null == longitude
            ? _value.longitude
            : longitude // ignore: cast_nullable_to_non_nullable
                  as double,
        radiusMeters: null == radiusMeters
            ? _value.radiusMeters
            : radiusMeters // ignore: cast_nullable_to_non_nullable
                  as double,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$NearbyPlaceRequestImpl implements _NearbyPlaceRequest {
  const _$NearbyPlaceRequestImpl({
    required this.latitude,
    required this.longitude,
    this.radiusMeters = 1000.0,
  });

  factory _$NearbyPlaceRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$NearbyPlaceRequestImplFromJson(json);

  @override
  final double latitude;
  @override
  final double longitude;
  @override
  @JsonKey()
  final double radiusMeters;

  @override
  String toString() {
    return 'NearbyPlaceRequest(latitude: $latitude, longitude: $longitude, radiusMeters: $radiusMeters)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$NearbyPlaceRequestImpl &&
            (identical(other.latitude, latitude) ||
                other.latitude == latitude) &&
            (identical(other.longitude, longitude) ||
                other.longitude == longitude) &&
            (identical(other.radiusMeters, radiusMeters) ||
                other.radiusMeters == radiusMeters));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, latitude, longitude, radiusMeters);

  /// Create a copy of NearbyPlaceRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$NearbyPlaceRequestImplCopyWith<_$NearbyPlaceRequestImpl> get copyWith =>
      __$$NearbyPlaceRequestImplCopyWithImpl<_$NearbyPlaceRequestImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$NearbyPlaceRequestImplToJson(this);
  }
}

abstract class _NearbyPlaceRequest implements NearbyPlaceRequest {
  const factory _NearbyPlaceRequest({
    required final double latitude,
    required final double longitude,
    final double radiusMeters,
  }) = _$NearbyPlaceRequestImpl;

  factory _NearbyPlaceRequest.fromJson(Map<String, dynamic> json) =
      _$NearbyPlaceRequestImpl.fromJson;

  @override
  double get latitude;
  @override
  double get longitude;
  @override
  double get radiusMeters;

  /// Create a copy of NearbyPlaceRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$NearbyPlaceRequestImplCopyWith<_$NearbyPlaceRequestImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
