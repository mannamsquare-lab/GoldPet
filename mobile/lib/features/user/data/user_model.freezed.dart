// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'user_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

UserModel _$UserModelFromJson(Map<String, dynamic> json) {
  return _UserModel.fromJson(json);
}

/// @nodoc
mixin _$UserModel {
  int get id => throw _privateConstructorUsedError;
  String? get email => throw _privateConstructorUsedError;
  String? get nickname => throw _privateConstructorUsedError;
  String? get gender => throw _privateConstructorUsedError;
  int? get birthYear => throw _privateConstructorUsedError;
  String? get mainLocationText => throw _privateConstructorUsedError;
  double? get mainLocationLat => throw _privateConstructorUsedError;
  double? get mainLocationLng => throw _privateConstructorUsedError;
  String? get profileImageUrl => throw _privateConstructorUsedError;
  int get goldBalance => throw _privateConstructorUsedError;
  bool get isActive => throw _privateConstructorUsedError;

  /// Serializes this UserModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of UserModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $UserModelCopyWith<UserModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserModelCopyWith<$Res> {
  factory $UserModelCopyWith(UserModel value, $Res Function(UserModel) then) =
      _$UserModelCopyWithImpl<$Res, UserModel>;
  @useResult
  $Res call({
    int id,
    String? email,
    String? nickname,
    String? gender,
    int? birthYear,
    String? mainLocationText,
    double? mainLocationLat,
    double? mainLocationLng,
    String? profileImageUrl,
    int goldBalance,
    bool isActive,
  });
}

/// @nodoc
class _$UserModelCopyWithImpl<$Res, $Val extends UserModel>
    implements $UserModelCopyWith<$Res> {
  _$UserModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of UserModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? email = freezed,
    Object? nickname = freezed,
    Object? gender = freezed,
    Object? birthYear = freezed,
    Object? mainLocationText = freezed,
    Object? mainLocationLat = freezed,
    Object? mainLocationLng = freezed,
    Object? profileImageUrl = freezed,
    Object? goldBalance = null,
    Object? isActive = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            email: freezed == email
                ? _value.email
                : email // ignore: cast_nullable_to_non_nullable
                      as String?,
            nickname: freezed == nickname
                ? _value.nickname
                : nickname // ignore: cast_nullable_to_non_nullable
                      as String?,
            gender: freezed == gender
                ? _value.gender
                : gender // ignore: cast_nullable_to_non_nullable
                      as String?,
            birthYear: freezed == birthYear
                ? _value.birthYear
                : birthYear // ignore: cast_nullable_to_non_nullable
                      as int?,
            mainLocationText: freezed == mainLocationText
                ? _value.mainLocationText
                : mainLocationText // ignore: cast_nullable_to_non_nullable
                      as String?,
            mainLocationLat: freezed == mainLocationLat
                ? _value.mainLocationLat
                : mainLocationLat // ignore: cast_nullable_to_non_nullable
                      as double?,
            mainLocationLng: freezed == mainLocationLng
                ? _value.mainLocationLng
                : mainLocationLng // ignore: cast_nullable_to_non_nullable
                      as double?,
            profileImageUrl: freezed == profileImageUrl
                ? _value.profileImageUrl
                : profileImageUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
            goldBalance: null == goldBalance
                ? _value.goldBalance
                : goldBalance // ignore: cast_nullable_to_non_nullable
                      as int,
            isActive: null == isActive
                ? _value.isActive
                : isActive // ignore: cast_nullable_to_non_nullable
                      as bool,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$UserModelImplCopyWith<$Res>
    implements $UserModelCopyWith<$Res> {
  factory _$$UserModelImplCopyWith(
    _$UserModelImpl value,
    $Res Function(_$UserModelImpl) then,
  ) = __$$UserModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    String? email,
    String? nickname,
    String? gender,
    int? birthYear,
    String? mainLocationText,
    double? mainLocationLat,
    double? mainLocationLng,
    String? profileImageUrl,
    int goldBalance,
    bool isActive,
  });
}

/// @nodoc
class __$$UserModelImplCopyWithImpl<$Res>
    extends _$UserModelCopyWithImpl<$Res, _$UserModelImpl>
    implements _$$UserModelImplCopyWith<$Res> {
  __$$UserModelImplCopyWithImpl(
    _$UserModelImpl _value,
    $Res Function(_$UserModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? email = freezed,
    Object? nickname = freezed,
    Object? gender = freezed,
    Object? birthYear = freezed,
    Object? mainLocationText = freezed,
    Object? mainLocationLat = freezed,
    Object? mainLocationLng = freezed,
    Object? profileImageUrl = freezed,
    Object? goldBalance = null,
    Object? isActive = null,
  }) {
    return _then(
      _$UserModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        email: freezed == email
            ? _value.email
            : email // ignore: cast_nullable_to_non_nullable
                  as String?,
        nickname: freezed == nickname
            ? _value.nickname
            : nickname // ignore: cast_nullable_to_non_nullable
                  as String?,
        gender: freezed == gender
            ? _value.gender
            : gender // ignore: cast_nullable_to_non_nullable
                  as String?,
        birthYear: freezed == birthYear
            ? _value.birthYear
            : birthYear // ignore: cast_nullable_to_non_nullable
                  as int?,
        mainLocationText: freezed == mainLocationText
            ? _value.mainLocationText
            : mainLocationText // ignore: cast_nullable_to_non_nullable
                  as String?,
        mainLocationLat: freezed == mainLocationLat
            ? _value.mainLocationLat
            : mainLocationLat // ignore: cast_nullable_to_non_nullable
                  as double?,
        mainLocationLng: freezed == mainLocationLng
            ? _value.mainLocationLng
            : mainLocationLng // ignore: cast_nullable_to_non_nullable
                  as double?,
        profileImageUrl: freezed == profileImageUrl
            ? _value.profileImageUrl
            : profileImageUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
        goldBalance: null == goldBalance
            ? _value.goldBalance
            : goldBalance // ignore: cast_nullable_to_non_nullable
                  as int,
        isActive: null == isActive
            ? _value.isActive
            : isActive // ignore: cast_nullable_to_non_nullable
                  as bool,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$UserModelImpl implements _UserModel {
  const _$UserModelImpl({
    required this.id,
    this.email,
    this.nickname,
    this.gender,
    this.birthYear,
    this.mainLocationText,
    this.mainLocationLat,
    this.mainLocationLng,
    this.profileImageUrl,
    this.goldBalance = 0,
    this.isActive = true,
  });

  factory _$UserModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$UserModelImplFromJson(json);

  @override
  final int id;
  @override
  final String? email;
  @override
  final String? nickname;
  @override
  final String? gender;
  @override
  final int? birthYear;
  @override
  final String? mainLocationText;
  @override
  final double? mainLocationLat;
  @override
  final double? mainLocationLng;
  @override
  final String? profileImageUrl;
  @override
  @JsonKey()
  final int goldBalance;
  @override
  @JsonKey()
  final bool isActive;

  @override
  String toString() {
    return 'UserModel(id: $id, email: $email, nickname: $nickname, gender: $gender, birthYear: $birthYear, mainLocationText: $mainLocationText, mainLocationLat: $mainLocationLat, mainLocationLng: $mainLocationLng, profileImageUrl: $profileImageUrl, goldBalance: $goldBalance, isActive: $isActive)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UserModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.nickname, nickname) ||
                other.nickname == nickname) &&
            (identical(other.gender, gender) || other.gender == gender) &&
            (identical(other.birthYear, birthYear) ||
                other.birthYear == birthYear) &&
            (identical(other.mainLocationText, mainLocationText) ||
                other.mainLocationText == mainLocationText) &&
            (identical(other.mainLocationLat, mainLocationLat) ||
                other.mainLocationLat == mainLocationLat) &&
            (identical(other.mainLocationLng, mainLocationLng) ||
                other.mainLocationLng == mainLocationLng) &&
            (identical(other.profileImageUrl, profileImageUrl) ||
                other.profileImageUrl == profileImageUrl) &&
            (identical(other.goldBalance, goldBalance) ||
                other.goldBalance == goldBalance) &&
            (identical(other.isActive, isActive) ||
                other.isActive == isActive));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    email,
    nickname,
    gender,
    birthYear,
    mainLocationText,
    mainLocationLat,
    mainLocationLng,
    profileImageUrl,
    goldBalance,
    isActive,
  );

  /// Create a copy of UserModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$UserModelImplCopyWith<_$UserModelImpl> get copyWith =>
      __$$UserModelImplCopyWithImpl<_$UserModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UserModelImplToJson(this);
  }
}

abstract class _UserModel implements UserModel {
  const factory _UserModel({
    required final int id,
    final String? email,
    final String? nickname,
    final String? gender,
    final int? birthYear,
    final String? mainLocationText,
    final double? mainLocationLat,
    final double? mainLocationLng,
    final String? profileImageUrl,
    final int goldBalance,
    final bool isActive,
  }) = _$UserModelImpl;

  factory _UserModel.fromJson(Map<String, dynamic> json) =
      _$UserModelImpl.fromJson;

  @override
  int get id;
  @override
  String? get email;
  @override
  String? get nickname;
  @override
  String? get gender;
  @override
  int? get birthYear;
  @override
  String? get mainLocationText;
  @override
  double? get mainLocationLat;
  @override
  double? get mainLocationLng;
  @override
  String? get profileImageUrl;
  @override
  int get goldBalance;
  @override
  bool get isActive;

  /// Create a copy of UserModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$UserModelImplCopyWith<_$UserModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
