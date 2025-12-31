// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'gamification_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

BadgeModel _$BadgeModelFromJson(Map<String, dynamic> json) {
  return _BadgeModel.fromJson(json);
}

/// @nodoc
mixin _$BadgeModel {
  int get id => throw _privateConstructorUsedError;
  String get code => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  String get imageUrl => throw _privateConstructorUsedError;
  DateTime? get earnedAt => throw _privateConstructorUsedError;

  /// Serializes this BadgeModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of BadgeModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $BadgeModelCopyWith<BadgeModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $BadgeModelCopyWith<$Res> {
  factory $BadgeModelCopyWith(
    BadgeModel value,
    $Res Function(BadgeModel) then,
  ) = _$BadgeModelCopyWithImpl<$Res, BadgeModel>;
  @useResult
  $Res call({
    int id,
    String code,
    String name,
    String description,
    String imageUrl,
    DateTime? earnedAt,
  });
}

/// @nodoc
class _$BadgeModelCopyWithImpl<$Res, $Val extends BadgeModel>
    implements $BadgeModelCopyWith<$Res> {
  _$BadgeModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of BadgeModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? code = null,
    Object? name = null,
    Object? description = null,
    Object? imageUrl = null,
    Object? earnedAt = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            code: null == code
                ? _value.code
                : code // ignore: cast_nullable_to_non_nullable
                      as String,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            description: null == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String,
            imageUrl: null == imageUrl
                ? _value.imageUrl
                : imageUrl // ignore: cast_nullable_to_non_nullable
                      as String,
            earnedAt: freezed == earnedAt
                ? _value.earnedAt
                : earnedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$BadgeModelImplCopyWith<$Res>
    implements $BadgeModelCopyWith<$Res> {
  factory _$$BadgeModelImplCopyWith(
    _$BadgeModelImpl value,
    $Res Function(_$BadgeModelImpl) then,
  ) = __$$BadgeModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    String code,
    String name,
    String description,
    String imageUrl,
    DateTime? earnedAt,
  });
}

/// @nodoc
class __$$BadgeModelImplCopyWithImpl<$Res>
    extends _$BadgeModelCopyWithImpl<$Res, _$BadgeModelImpl>
    implements _$$BadgeModelImplCopyWith<$Res> {
  __$$BadgeModelImplCopyWithImpl(
    _$BadgeModelImpl _value,
    $Res Function(_$BadgeModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of BadgeModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? code = null,
    Object? name = null,
    Object? description = null,
    Object? imageUrl = null,
    Object? earnedAt = freezed,
  }) {
    return _then(
      _$BadgeModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        code: null == code
            ? _value.code
            : code // ignore: cast_nullable_to_non_nullable
                  as String,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        description: null == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String,
        imageUrl: null == imageUrl
            ? _value.imageUrl
            : imageUrl // ignore: cast_nullable_to_non_nullable
                  as String,
        earnedAt: freezed == earnedAt
            ? _value.earnedAt
            : earnedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$BadgeModelImpl implements _BadgeModel {
  const _$BadgeModelImpl({
    required this.id,
    required this.code,
    required this.name,
    required this.description,
    required this.imageUrl,
    this.earnedAt,
  });

  factory _$BadgeModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$BadgeModelImplFromJson(json);

  @override
  final int id;
  @override
  final String code;
  @override
  final String name;
  @override
  final String description;
  @override
  final String imageUrl;
  @override
  final DateTime? earnedAt;

  @override
  String toString() {
    return 'BadgeModel(id: $id, code: $code, name: $name, description: $description, imageUrl: $imageUrl, earnedAt: $earnedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$BadgeModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.code, code) || other.code == code) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.imageUrl, imageUrl) ||
                other.imageUrl == imageUrl) &&
            (identical(other.earnedAt, earnedAt) ||
                other.earnedAt == earnedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, code, name, description, imageUrl, earnedAt);

  /// Create a copy of BadgeModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$BadgeModelImplCopyWith<_$BadgeModelImpl> get copyWith =>
      __$$BadgeModelImplCopyWithImpl<_$BadgeModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$BadgeModelImplToJson(this);
  }
}

abstract class _BadgeModel implements BadgeModel {
  const factory _BadgeModel({
    required final int id,
    required final String code,
    required final String name,
    required final String description,
    required final String imageUrl,
    final DateTime? earnedAt,
  }) = _$BadgeModelImpl;

  factory _BadgeModel.fromJson(Map<String, dynamic> json) =
      _$BadgeModelImpl.fromJson;

  @override
  int get id;
  @override
  String get code;
  @override
  String get name;
  @override
  String get description;
  @override
  String get imageUrl;
  @override
  DateTime? get earnedAt;

  /// Create a copy of BadgeModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$BadgeModelImplCopyWith<_$BadgeModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ChallengeModel _$ChallengeModelFromJson(Map<String, dynamic> json) {
  return _ChallengeModel.fromJson(json);
}

/// @nodoc
mixin _$ChallengeModel {
  int get id => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  String get goalType =>
      throw _privateConstructorUsedError; // DISTANCE, WALK_COUNT, etc.
  int get goalValue => throw _privateConstructorUsedError;
  int? get rewardGold => throw _privateConstructorUsedError;
  String? get rewardBadgeName => throw _privateConstructorUsedError;
  DateTime get startDate => throw _privateConstructorUsedError;
  DateTime get endDate => throw _privateConstructorUsedError;
  bool get isActive => throw _privateConstructorUsedError;

  /// Serializes this ChallengeModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ChallengeModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ChallengeModelCopyWith<ChallengeModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ChallengeModelCopyWith<$Res> {
  factory $ChallengeModelCopyWith(
    ChallengeModel value,
    $Res Function(ChallengeModel) then,
  ) = _$ChallengeModelCopyWithImpl<$Res, ChallengeModel>;
  @useResult
  $Res call({
    int id,
    String title,
    String description,
    String goalType,
    int goalValue,
    int? rewardGold,
    String? rewardBadgeName,
    DateTime startDate,
    DateTime endDate,
    bool isActive,
  });
}

/// @nodoc
class _$ChallengeModelCopyWithImpl<$Res, $Val extends ChallengeModel>
    implements $ChallengeModelCopyWith<$Res> {
  _$ChallengeModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ChallengeModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? description = null,
    Object? goalType = null,
    Object? goalValue = null,
    Object? rewardGold = freezed,
    Object? rewardBadgeName = freezed,
    Object? startDate = null,
    Object? endDate = null,
    Object? isActive = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            title: null == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                      as String,
            description: null == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String,
            goalType: null == goalType
                ? _value.goalType
                : goalType // ignore: cast_nullable_to_non_nullable
                      as String,
            goalValue: null == goalValue
                ? _value.goalValue
                : goalValue // ignore: cast_nullable_to_non_nullable
                      as int,
            rewardGold: freezed == rewardGold
                ? _value.rewardGold
                : rewardGold // ignore: cast_nullable_to_non_nullable
                      as int?,
            rewardBadgeName: freezed == rewardBadgeName
                ? _value.rewardBadgeName
                : rewardBadgeName // ignore: cast_nullable_to_non_nullable
                      as String?,
            startDate: null == startDate
                ? _value.startDate
                : startDate // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            endDate: null == endDate
                ? _value.endDate
                : endDate // ignore: cast_nullable_to_non_nullable
                      as DateTime,
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
abstract class _$$ChallengeModelImplCopyWith<$Res>
    implements $ChallengeModelCopyWith<$Res> {
  factory _$$ChallengeModelImplCopyWith(
    _$ChallengeModelImpl value,
    $Res Function(_$ChallengeModelImpl) then,
  ) = __$$ChallengeModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    String title,
    String description,
    String goalType,
    int goalValue,
    int? rewardGold,
    String? rewardBadgeName,
    DateTime startDate,
    DateTime endDate,
    bool isActive,
  });
}

/// @nodoc
class __$$ChallengeModelImplCopyWithImpl<$Res>
    extends _$ChallengeModelCopyWithImpl<$Res, _$ChallengeModelImpl>
    implements _$$ChallengeModelImplCopyWith<$Res> {
  __$$ChallengeModelImplCopyWithImpl(
    _$ChallengeModelImpl _value,
    $Res Function(_$ChallengeModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ChallengeModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? description = null,
    Object? goalType = null,
    Object? goalValue = null,
    Object? rewardGold = freezed,
    Object? rewardBadgeName = freezed,
    Object? startDate = null,
    Object? endDate = null,
    Object? isActive = null,
  }) {
    return _then(
      _$ChallengeModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        title: null == title
            ? _value.title
            : title // ignore: cast_nullable_to_non_nullable
                  as String,
        description: null == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String,
        goalType: null == goalType
            ? _value.goalType
            : goalType // ignore: cast_nullable_to_non_nullable
                  as String,
        goalValue: null == goalValue
            ? _value.goalValue
            : goalValue // ignore: cast_nullable_to_non_nullable
                  as int,
        rewardGold: freezed == rewardGold
            ? _value.rewardGold
            : rewardGold // ignore: cast_nullable_to_non_nullable
                  as int?,
        rewardBadgeName: freezed == rewardBadgeName
            ? _value.rewardBadgeName
            : rewardBadgeName // ignore: cast_nullable_to_non_nullable
                  as String?,
        startDate: null == startDate
            ? _value.startDate
            : startDate // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        endDate: null == endDate
            ? _value.endDate
            : endDate // ignore: cast_nullable_to_non_nullable
                  as DateTime,
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
class _$ChallengeModelImpl implements _ChallengeModel {
  const _$ChallengeModelImpl({
    required this.id,
    required this.title,
    required this.description,
    required this.goalType,
    required this.goalValue,
    this.rewardGold,
    this.rewardBadgeName,
    required this.startDate,
    required this.endDate,
    required this.isActive,
  });

  factory _$ChallengeModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$ChallengeModelImplFromJson(json);

  @override
  final int id;
  @override
  final String title;
  @override
  final String description;
  @override
  final String goalType;
  // DISTANCE, WALK_COUNT, etc.
  @override
  final int goalValue;
  @override
  final int? rewardGold;
  @override
  final String? rewardBadgeName;
  @override
  final DateTime startDate;
  @override
  final DateTime endDate;
  @override
  final bool isActive;

  @override
  String toString() {
    return 'ChallengeModel(id: $id, title: $title, description: $description, goalType: $goalType, goalValue: $goalValue, rewardGold: $rewardGold, rewardBadgeName: $rewardBadgeName, startDate: $startDate, endDate: $endDate, isActive: $isActive)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ChallengeModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.goalType, goalType) ||
                other.goalType == goalType) &&
            (identical(other.goalValue, goalValue) ||
                other.goalValue == goalValue) &&
            (identical(other.rewardGold, rewardGold) ||
                other.rewardGold == rewardGold) &&
            (identical(other.rewardBadgeName, rewardBadgeName) ||
                other.rewardBadgeName == rewardBadgeName) &&
            (identical(other.startDate, startDate) ||
                other.startDate == startDate) &&
            (identical(other.endDate, endDate) || other.endDate == endDate) &&
            (identical(other.isActive, isActive) ||
                other.isActive == isActive));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    title,
    description,
    goalType,
    goalValue,
    rewardGold,
    rewardBadgeName,
    startDate,
    endDate,
    isActive,
  );

  /// Create a copy of ChallengeModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ChallengeModelImplCopyWith<_$ChallengeModelImpl> get copyWith =>
      __$$ChallengeModelImplCopyWithImpl<_$ChallengeModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$ChallengeModelImplToJson(this);
  }
}

abstract class _ChallengeModel implements ChallengeModel {
  const factory _ChallengeModel({
    required final int id,
    required final String title,
    required final String description,
    required final String goalType,
    required final int goalValue,
    final int? rewardGold,
    final String? rewardBadgeName,
    required final DateTime startDate,
    required final DateTime endDate,
    required final bool isActive,
  }) = _$ChallengeModelImpl;

  factory _ChallengeModel.fromJson(Map<String, dynamic> json) =
      _$ChallengeModelImpl.fromJson;

  @override
  int get id;
  @override
  String get title;
  @override
  String get description;
  @override
  String get goalType; // DISTANCE, WALK_COUNT, etc.
  @override
  int get goalValue;
  @override
  int? get rewardGold;
  @override
  String? get rewardBadgeName;
  @override
  DateTime get startDate;
  @override
  DateTime get endDate;
  @override
  bool get isActive;

  /// Create a copy of ChallengeModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ChallengeModelImplCopyWith<_$ChallengeModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ChallengeProgressModel _$ChallengeProgressModelFromJson(
  Map<String, dynamic> json,
) {
  return _ChallengeProgressModel.fromJson(json);
}

/// @nodoc
mixin _$ChallengeProgressModel {
  int get challengeId => throw _privateConstructorUsedError;
  String get challengeTitle => throw _privateConstructorUsedError;
  int get goalValue => throw _privateConstructorUsedError;
  int get currentValue => throw _privateConstructorUsedError;
  int get progressPercent => throw _privateConstructorUsedError;
  String get status =>
      throw _privateConstructorUsedError; // IN_PROGRESS, COMPLETED, FAILED
  DateTime? get completedAt => throw _privateConstructorUsedError;

  /// Serializes this ChallengeProgressModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ChallengeProgressModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ChallengeProgressModelCopyWith<ChallengeProgressModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ChallengeProgressModelCopyWith<$Res> {
  factory $ChallengeProgressModelCopyWith(
    ChallengeProgressModel value,
    $Res Function(ChallengeProgressModel) then,
  ) = _$ChallengeProgressModelCopyWithImpl<$Res, ChallengeProgressModel>;
  @useResult
  $Res call({
    int challengeId,
    String challengeTitle,
    int goalValue,
    int currentValue,
    int progressPercent,
    String status,
    DateTime? completedAt,
  });
}

/// @nodoc
class _$ChallengeProgressModelCopyWithImpl<
  $Res,
  $Val extends ChallengeProgressModel
>
    implements $ChallengeProgressModelCopyWith<$Res> {
  _$ChallengeProgressModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ChallengeProgressModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? challengeId = null,
    Object? challengeTitle = null,
    Object? goalValue = null,
    Object? currentValue = null,
    Object? progressPercent = null,
    Object? status = null,
    Object? completedAt = freezed,
  }) {
    return _then(
      _value.copyWith(
            challengeId: null == challengeId
                ? _value.challengeId
                : challengeId // ignore: cast_nullable_to_non_nullable
                      as int,
            challengeTitle: null == challengeTitle
                ? _value.challengeTitle
                : challengeTitle // ignore: cast_nullable_to_non_nullable
                      as String,
            goalValue: null == goalValue
                ? _value.goalValue
                : goalValue // ignore: cast_nullable_to_non_nullable
                      as int,
            currentValue: null == currentValue
                ? _value.currentValue
                : currentValue // ignore: cast_nullable_to_non_nullable
                      as int,
            progressPercent: null == progressPercent
                ? _value.progressPercent
                : progressPercent // ignore: cast_nullable_to_non_nullable
                      as int,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            completedAt: freezed == completedAt
                ? _value.completedAt
                : completedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$ChallengeProgressModelImplCopyWith<$Res>
    implements $ChallengeProgressModelCopyWith<$Res> {
  factory _$$ChallengeProgressModelImplCopyWith(
    _$ChallengeProgressModelImpl value,
    $Res Function(_$ChallengeProgressModelImpl) then,
  ) = __$$ChallengeProgressModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int challengeId,
    String challengeTitle,
    int goalValue,
    int currentValue,
    int progressPercent,
    String status,
    DateTime? completedAt,
  });
}

/// @nodoc
class __$$ChallengeProgressModelImplCopyWithImpl<$Res>
    extends
        _$ChallengeProgressModelCopyWithImpl<$Res, _$ChallengeProgressModelImpl>
    implements _$$ChallengeProgressModelImplCopyWith<$Res> {
  __$$ChallengeProgressModelImplCopyWithImpl(
    _$ChallengeProgressModelImpl _value,
    $Res Function(_$ChallengeProgressModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ChallengeProgressModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? challengeId = null,
    Object? challengeTitle = null,
    Object? goalValue = null,
    Object? currentValue = null,
    Object? progressPercent = null,
    Object? status = null,
    Object? completedAt = freezed,
  }) {
    return _then(
      _$ChallengeProgressModelImpl(
        challengeId: null == challengeId
            ? _value.challengeId
            : challengeId // ignore: cast_nullable_to_non_nullable
                  as int,
        challengeTitle: null == challengeTitle
            ? _value.challengeTitle
            : challengeTitle // ignore: cast_nullable_to_non_nullable
                  as String,
        goalValue: null == goalValue
            ? _value.goalValue
            : goalValue // ignore: cast_nullable_to_non_nullable
                  as int,
        currentValue: null == currentValue
            ? _value.currentValue
            : currentValue // ignore: cast_nullable_to_non_nullable
                  as int,
        progressPercent: null == progressPercent
            ? _value.progressPercent
            : progressPercent // ignore: cast_nullable_to_non_nullable
                  as int,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        completedAt: freezed == completedAt
            ? _value.completedAt
            : completedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ChallengeProgressModelImpl implements _ChallengeProgressModel {
  const _$ChallengeProgressModelImpl({
    required this.challengeId,
    required this.challengeTitle,
    required this.goalValue,
    required this.currentValue,
    required this.progressPercent,
    required this.status,
    this.completedAt,
  });

  factory _$ChallengeProgressModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$ChallengeProgressModelImplFromJson(json);

  @override
  final int challengeId;
  @override
  final String challengeTitle;
  @override
  final int goalValue;
  @override
  final int currentValue;
  @override
  final int progressPercent;
  @override
  final String status;
  // IN_PROGRESS, COMPLETED, FAILED
  @override
  final DateTime? completedAt;

  @override
  String toString() {
    return 'ChallengeProgressModel(challengeId: $challengeId, challengeTitle: $challengeTitle, goalValue: $goalValue, currentValue: $currentValue, progressPercent: $progressPercent, status: $status, completedAt: $completedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ChallengeProgressModelImpl &&
            (identical(other.challengeId, challengeId) ||
                other.challengeId == challengeId) &&
            (identical(other.challengeTitle, challengeTitle) ||
                other.challengeTitle == challengeTitle) &&
            (identical(other.goalValue, goalValue) ||
                other.goalValue == goalValue) &&
            (identical(other.currentValue, currentValue) ||
                other.currentValue == currentValue) &&
            (identical(other.progressPercent, progressPercent) ||
                other.progressPercent == progressPercent) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.completedAt, completedAt) ||
                other.completedAt == completedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    challengeId,
    challengeTitle,
    goalValue,
    currentValue,
    progressPercent,
    status,
    completedAt,
  );

  /// Create a copy of ChallengeProgressModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ChallengeProgressModelImplCopyWith<_$ChallengeProgressModelImpl>
  get copyWith =>
      __$$ChallengeProgressModelImplCopyWithImpl<_$ChallengeProgressModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$ChallengeProgressModelImplToJson(this);
  }
}

abstract class _ChallengeProgressModel implements ChallengeProgressModel {
  const factory _ChallengeProgressModel({
    required final int challengeId,
    required final String challengeTitle,
    required final int goalValue,
    required final int currentValue,
    required final int progressPercent,
    required final String status,
    final DateTime? completedAt,
  }) = _$ChallengeProgressModelImpl;

  factory _ChallengeProgressModel.fromJson(Map<String, dynamic> json) =
      _$ChallengeProgressModelImpl.fromJson;

  @override
  int get challengeId;
  @override
  String get challengeTitle;
  @override
  int get goalValue;
  @override
  int get currentValue;
  @override
  int get progressPercent;
  @override
  String get status; // IN_PROGRESS, COMPLETED, FAILED
  @override
  DateTime? get completedAt;

  /// Create a copy of ChallengeProgressModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ChallengeProgressModelImplCopyWith<_$ChallengeProgressModelImpl>
  get copyWith => throw _privateConstructorUsedError;
}
