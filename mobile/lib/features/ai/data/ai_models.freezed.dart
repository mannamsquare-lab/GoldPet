// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'ai_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

AIStyleOption _$AIStyleOptionFromJson(Map<String, dynamic> json) {
  return _AIStyleOption.fromJson(json);
}

/// @nodoc
mixin _$AIStyleOption {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  String get previewUrl => throw _privateConstructorUsedError;
  int get goldCost => throw _privateConstructorUsedError;

  /// Serializes this AIStyleOption to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of AIStyleOption
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AIStyleOptionCopyWith<AIStyleOption> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AIStyleOptionCopyWith<$Res> {
  factory $AIStyleOptionCopyWith(
    AIStyleOption value,
    $Res Function(AIStyleOption) then,
  ) = _$AIStyleOptionCopyWithImpl<$Res, AIStyleOption>;
  @useResult
  $Res call({
    String id,
    String name,
    String description,
    String previewUrl,
    int goldCost,
  });
}

/// @nodoc
class _$AIStyleOptionCopyWithImpl<$Res, $Val extends AIStyleOption>
    implements $AIStyleOptionCopyWith<$Res> {
  _$AIStyleOptionCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AIStyleOption
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? description = null,
    Object? previewUrl = null,
    Object? goldCost = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            description: null == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String,
            previewUrl: null == previewUrl
                ? _value.previewUrl
                : previewUrl // ignore: cast_nullable_to_non_nullable
                      as String,
            goldCost: null == goldCost
                ? _value.goldCost
                : goldCost // ignore: cast_nullable_to_non_nullable
                      as int,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$AIStyleOptionImplCopyWith<$Res>
    implements $AIStyleOptionCopyWith<$Res> {
  factory _$$AIStyleOptionImplCopyWith(
    _$AIStyleOptionImpl value,
    $Res Function(_$AIStyleOptionImpl) then,
  ) = __$$AIStyleOptionImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String name,
    String description,
    String previewUrl,
    int goldCost,
  });
}

/// @nodoc
class __$$AIStyleOptionImplCopyWithImpl<$Res>
    extends _$AIStyleOptionCopyWithImpl<$Res, _$AIStyleOptionImpl>
    implements _$$AIStyleOptionImplCopyWith<$Res> {
  __$$AIStyleOptionImplCopyWithImpl(
    _$AIStyleOptionImpl _value,
    $Res Function(_$AIStyleOptionImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of AIStyleOption
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? description = null,
    Object? previewUrl = null,
    Object? goldCost = null,
  }) {
    return _then(
      _$AIStyleOptionImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        description: null == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String,
        previewUrl: null == previewUrl
            ? _value.previewUrl
            : previewUrl // ignore: cast_nullable_to_non_nullable
                  as String,
        goldCost: null == goldCost
            ? _value.goldCost
            : goldCost // ignore: cast_nullable_to_non_nullable
                  as int,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$AIStyleOptionImpl implements _AIStyleOption {
  const _$AIStyleOptionImpl({
    required this.id,
    required this.name,
    required this.description,
    required this.previewUrl,
    required this.goldCost,
  });

  factory _$AIStyleOptionImpl.fromJson(Map<String, dynamic> json) =>
      _$$AIStyleOptionImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String description;
  @override
  final String previewUrl;
  @override
  final int goldCost;

  @override
  String toString() {
    return 'AIStyleOption(id: $id, name: $name, description: $description, previewUrl: $previewUrl, goldCost: $goldCost)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AIStyleOptionImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.previewUrl, previewUrl) ||
                other.previewUrl == previewUrl) &&
            (identical(other.goldCost, goldCost) ||
                other.goldCost == goldCost));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, name, description, previewUrl, goldCost);

  /// Create a copy of AIStyleOption
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AIStyleOptionImplCopyWith<_$AIStyleOptionImpl> get copyWith =>
      __$$AIStyleOptionImplCopyWithImpl<_$AIStyleOptionImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AIStyleOptionImplToJson(this);
  }
}

abstract class _AIStyleOption implements AIStyleOption {
  const factory _AIStyleOption({
    required final String id,
    required final String name,
    required final String description,
    required final String previewUrl,
    required final int goldCost,
  }) = _$AIStyleOptionImpl;

  factory _AIStyleOption.fromJson(Map<String, dynamic> json) =
      _$AIStyleOptionImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  String get description;
  @override
  String get previewUrl;
  @override
  int get goldCost;

  /// Create a copy of AIStyleOption
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AIStyleOptionImplCopyWith<_$AIStyleOptionImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

CreateAIProfileRequest _$CreateAIProfileRequestFromJson(
  Map<String, dynamic> json,
) {
  return _CreateAIProfileRequest.fromJson(json);
}

/// @nodoc
mixin _$CreateAIProfileRequest {
  int get petId => throw _privateConstructorUsedError;
  AIRequestType get type => throw _privateConstructorUsedError;
  String get sourceImageUrl => throw _privateConstructorUsedError;
  String? get stylePrompt => throw _privateConstructorUsedError;

  /// Serializes this CreateAIProfileRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CreateAIProfileRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CreateAIProfileRequestCopyWith<CreateAIProfileRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CreateAIProfileRequestCopyWith<$Res> {
  factory $CreateAIProfileRequestCopyWith(
    CreateAIProfileRequest value,
    $Res Function(CreateAIProfileRequest) then,
  ) = _$CreateAIProfileRequestCopyWithImpl<$Res, CreateAIProfileRequest>;
  @useResult
  $Res call({
    int petId,
    AIRequestType type,
    String sourceImageUrl,
    String? stylePrompt,
  });
}

/// @nodoc
class _$CreateAIProfileRequestCopyWithImpl<
  $Res,
  $Val extends CreateAIProfileRequest
>
    implements $CreateAIProfileRequestCopyWith<$Res> {
  _$CreateAIProfileRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CreateAIProfileRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? petId = null,
    Object? type = null,
    Object? sourceImageUrl = null,
    Object? stylePrompt = freezed,
  }) {
    return _then(
      _value.copyWith(
            petId: null == petId
                ? _value.petId
                : petId // ignore: cast_nullable_to_non_nullable
                      as int,
            type: null == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as AIRequestType,
            sourceImageUrl: null == sourceImageUrl
                ? _value.sourceImageUrl
                : sourceImageUrl // ignore: cast_nullable_to_non_nullable
                      as String,
            stylePrompt: freezed == stylePrompt
                ? _value.stylePrompt
                : stylePrompt // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CreateAIProfileRequestImplCopyWith<$Res>
    implements $CreateAIProfileRequestCopyWith<$Res> {
  factory _$$CreateAIProfileRequestImplCopyWith(
    _$CreateAIProfileRequestImpl value,
    $Res Function(_$CreateAIProfileRequestImpl) then,
  ) = __$$CreateAIProfileRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int petId,
    AIRequestType type,
    String sourceImageUrl,
    String? stylePrompt,
  });
}

/// @nodoc
class __$$CreateAIProfileRequestImplCopyWithImpl<$Res>
    extends
        _$CreateAIProfileRequestCopyWithImpl<$Res, _$CreateAIProfileRequestImpl>
    implements _$$CreateAIProfileRequestImplCopyWith<$Res> {
  __$$CreateAIProfileRequestImplCopyWithImpl(
    _$CreateAIProfileRequestImpl _value,
    $Res Function(_$CreateAIProfileRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CreateAIProfileRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? petId = null,
    Object? type = null,
    Object? sourceImageUrl = null,
    Object? stylePrompt = freezed,
  }) {
    return _then(
      _$CreateAIProfileRequestImpl(
        petId: null == petId
            ? _value.petId
            : petId // ignore: cast_nullable_to_non_nullable
                  as int,
        type: null == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as AIRequestType,
        sourceImageUrl: null == sourceImageUrl
            ? _value.sourceImageUrl
            : sourceImageUrl // ignore: cast_nullable_to_non_nullable
                  as String,
        stylePrompt: freezed == stylePrompt
            ? _value.stylePrompt
            : stylePrompt // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$CreateAIProfileRequestImpl implements _CreateAIProfileRequest {
  const _$CreateAIProfileRequestImpl({
    required this.petId,
    required this.type,
    required this.sourceImageUrl,
    this.stylePrompt,
  });

  factory _$CreateAIProfileRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$CreateAIProfileRequestImplFromJson(json);

  @override
  final int petId;
  @override
  final AIRequestType type;
  @override
  final String sourceImageUrl;
  @override
  final String? stylePrompt;

  @override
  String toString() {
    return 'CreateAIProfileRequest(petId: $petId, type: $type, sourceImageUrl: $sourceImageUrl, stylePrompt: $stylePrompt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CreateAIProfileRequestImpl &&
            (identical(other.petId, petId) || other.petId == petId) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.sourceImageUrl, sourceImageUrl) ||
                other.sourceImageUrl == sourceImageUrl) &&
            (identical(other.stylePrompt, stylePrompt) ||
                other.stylePrompt == stylePrompt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, petId, type, sourceImageUrl, stylePrompt);

  /// Create a copy of CreateAIProfileRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CreateAIProfileRequestImplCopyWith<_$CreateAIProfileRequestImpl>
  get copyWith =>
      __$$CreateAIProfileRequestImplCopyWithImpl<_$CreateAIProfileRequestImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$CreateAIProfileRequestImplToJson(this);
  }
}

abstract class _CreateAIProfileRequest implements CreateAIProfileRequest {
  const factory _CreateAIProfileRequest({
    required final int petId,
    required final AIRequestType type,
    required final String sourceImageUrl,
    final String? stylePrompt,
  }) = _$CreateAIProfileRequestImpl;

  factory _CreateAIProfileRequest.fromJson(Map<String, dynamic> json) =
      _$CreateAIProfileRequestImpl.fromJson;

  @override
  int get petId;
  @override
  AIRequestType get type;
  @override
  String get sourceImageUrl;
  @override
  String? get stylePrompt;

  /// Create a copy of CreateAIProfileRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CreateAIProfileRequestImplCopyWith<_$CreateAIProfileRequestImpl>
  get copyWith => throw _privateConstructorUsedError;
}

AIProfileRequestResponse _$AIProfileRequestResponseFromJson(
  Map<String, dynamic> json,
) {
  return _AIProfileRequestResponse.fromJson(json);
}

/// @nodoc
mixin _$AIProfileRequestResponse {
  int get id => throw _privateConstructorUsedError;
  int get petId => throw _privateConstructorUsedError;
  String get petName => throw _privateConstructorUsedError;
  AIRequestType get type => throw _privateConstructorUsedError;
  String get sourceImageUrl => throw _privateConstructorUsedError;
  String? get stylePrompt => throw _privateConstructorUsedError;
  AIRequestStatus get status => throw _privateConstructorUsedError;
  String? get resultUrl => throw _privateConstructorUsedError;
  String? get errorMessage => throw _privateConstructorUsedError;
  int get goldCost => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;

  /// Serializes this AIProfileRequestResponse to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of AIProfileRequestResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AIProfileRequestResponseCopyWith<AIProfileRequestResponse> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AIProfileRequestResponseCopyWith<$Res> {
  factory $AIProfileRequestResponseCopyWith(
    AIProfileRequestResponse value,
    $Res Function(AIProfileRequestResponse) then,
  ) = _$AIProfileRequestResponseCopyWithImpl<$Res, AIProfileRequestResponse>;
  @useResult
  $Res call({
    int id,
    int petId,
    String petName,
    AIRequestType type,
    String sourceImageUrl,
    String? stylePrompt,
    AIRequestStatus status,
    String? resultUrl,
    String? errorMessage,
    int goldCost,
    DateTime? createdAt,
  });
}

/// @nodoc
class _$AIProfileRequestResponseCopyWithImpl<
  $Res,
  $Val extends AIProfileRequestResponse
>
    implements $AIProfileRequestResponseCopyWith<$Res> {
  _$AIProfileRequestResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AIProfileRequestResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? petId = null,
    Object? petName = null,
    Object? type = null,
    Object? sourceImageUrl = null,
    Object? stylePrompt = freezed,
    Object? status = null,
    Object? resultUrl = freezed,
    Object? errorMessage = freezed,
    Object? goldCost = null,
    Object? createdAt = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            petId: null == petId
                ? _value.petId
                : petId // ignore: cast_nullable_to_non_nullable
                      as int,
            petName: null == petName
                ? _value.petName
                : petName // ignore: cast_nullable_to_non_nullable
                      as String,
            type: null == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as AIRequestType,
            sourceImageUrl: null == sourceImageUrl
                ? _value.sourceImageUrl
                : sourceImageUrl // ignore: cast_nullable_to_non_nullable
                      as String,
            stylePrompt: freezed == stylePrompt
                ? _value.stylePrompt
                : stylePrompt // ignore: cast_nullable_to_non_nullable
                      as String?,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as AIRequestStatus,
            resultUrl: freezed == resultUrl
                ? _value.resultUrl
                : resultUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
            errorMessage: freezed == errorMessage
                ? _value.errorMessage
                : errorMessage // ignore: cast_nullable_to_non_nullable
                      as String?,
            goldCost: null == goldCost
                ? _value.goldCost
                : goldCost // ignore: cast_nullable_to_non_nullable
                      as int,
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
abstract class _$$AIProfileRequestResponseImplCopyWith<$Res>
    implements $AIProfileRequestResponseCopyWith<$Res> {
  factory _$$AIProfileRequestResponseImplCopyWith(
    _$AIProfileRequestResponseImpl value,
    $Res Function(_$AIProfileRequestResponseImpl) then,
  ) = __$$AIProfileRequestResponseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    int petId,
    String petName,
    AIRequestType type,
    String sourceImageUrl,
    String? stylePrompt,
    AIRequestStatus status,
    String? resultUrl,
    String? errorMessage,
    int goldCost,
    DateTime? createdAt,
  });
}

/// @nodoc
class __$$AIProfileRequestResponseImplCopyWithImpl<$Res>
    extends
        _$AIProfileRequestResponseCopyWithImpl<
          $Res,
          _$AIProfileRequestResponseImpl
        >
    implements _$$AIProfileRequestResponseImplCopyWith<$Res> {
  __$$AIProfileRequestResponseImplCopyWithImpl(
    _$AIProfileRequestResponseImpl _value,
    $Res Function(_$AIProfileRequestResponseImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of AIProfileRequestResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? petId = null,
    Object? petName = null,
    Object? type = null,
    Object? sourceImageUrl = null,
    Object? stylePrompt = freezed,
    Object? status = null,
    Object? resultUrl = freezed,
    Object? errorMessage = freezed,
    Object? goldCost = null,
    Object? createdAt = freezed,
  }) {
    return _then(
      _$AIProfileRequestResponseImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        petId: null == petId
            ? _value.petId
            : petId // ignore: cast_nullable_to_non_nullable
                  as int,
        petName: null == petName
            ? _value.petName
            : petName // ignore: cast_nullable_to_non_nullable
                  as String,
        type: null == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as AIRequestType,
        sourceImageUrl: null == sourceImageUrl
            ? _value.sourceImageUrl
            : sourceImageUrl // ignore: cast_nullable_to_non_nullable
                  as String,
        stylePrompt: freezed == stylePrompt
            ? _value.stylePrompt
            : stylePrompt // ignore: cast_nullable_to_non_nullable
                  as String?,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as AIRequestStatus,
        resultUrl: freezed == resultUrl
            ? _value.resultUrl
            : resultUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
        errorMessage: freezed == errorMessage
            ? _value.errorMessage
            : errorMessage // ignore: cast_nullable_to_non_nullable
                  as String?,
        goldCost: null == goldCost
            ? _value.goldCost
            : goldCost // ignore: cast_nullable_to_non_nullable
                  as int,
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
class _$AIProfileRequestResponseImpl implements _AIProfileRequestResponse {
  const _$AIProfileRequestResponseImpl({
    required this.id,
    required this.petId,
    required this.petName,
    required this.type,
    required this.sourceImageUrl,
    this.stylePrompt,
    required this.status,
    this.resultUrl,
    this.errorMessage,
    required this.goldCost,
    this.createdAt,
  });

  factory _$AIProfileRequestResponseImpl.fromJson(Map<String, dynamic> json) =>
      _$$AIProfileRequestResponseImplFromJson(json);

  @override
  final int id;
  @override
  final int petId;
  @override
  final String petName;
  @override
  final AIRequestType type;
  @override
  final String sourceImageUrl;
  @override
  final String? stylePrompt;
  @override
  final AIRequestStatus status;
  @override
  final String? resultUrl;
  @override
  final String? errorMessage;
  @override
  final int goldCost;
  @override
  final DateTime? createdAt;

  @override
  String toString() {
    return 'AIProfileRequestResponse(id: $id, petId: $petId, petName: $petName, type: $type, sourceImageUrl: $sourceImageUrl, stylePrompt: $stylePrompt, status: $status, resultUrl: $resultUrl, errorMessage: $errorMessage, goldCost: $goldCost, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AIProfileRequestResponseImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.petId, petId) || other.petId == petId) &&
            (identical(other.petName, petName) || other.petName == petName) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.sourceImageUrl, sourceImageUrl) ||
                other.sourceImageUrl == sourceImageUrl) &&
            (identical(other.stylePrompt, stylePrompt) ||
                other.stylePrompt == stylePrompt) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.resultUrl, resultUrl) ||
                other.resultUrl == resultUrl) &&
            (identical(other.errorMessage, errorMessage) ||
                other.errorMessage == errorMessage) &&
            (identical(other.goldCost, goldCost) ||
                other.goldCost == goldCost) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    petId,
    petName,
    type,
    sourceImageUrl,
    stylePrompt,
    status,
    resultUrl,
    errorMessage,
    goldCost,
    createdAt,
  );

  /// Create a copy of AIProfileRequestResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AIProfileRequestResponseImplCopyWith<_$AIProfileRequestResponseImpl>
  get copyWith =>
      __$$AIProfileRequestResponseImplCopyWithImpl<
        _$AIProfileRequestResponseImpl
      >(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AIProfileRequestResponseImplToJson(this);
  }
}

abstract class _AIProfileRequestResponse implements AIProfileRequestResponse {
  const factory _AIProfileRequestResponse({
    required final int id,
    required final int petId,
    required final String petName,
    required final AIRequestType type,
    required final String sourceImageUrl,
    final String? stylePrompt,
    required final AIRequestStatus status,
    final String? resultUrl,
    final String? errorMessage,
    required final int goldCost,
    final DateTime? createdAt,
  }) = _$AIProfileRequestResponseImpl;

  factory _AIProfileRequestResponse.fromJson(Map<String, dynamic> json) =
      _$AIProfileRequestResponseImpl.fromJson;

  @override
  int get id;
  @override
  int get petId;
  @override
  String get petName;
  @override
  AIRequestType get type;
  @override
  String get sourceImageUrl;
  @override
  String? get stylePrompt;
  @override
  AIRequestStatus get status;
  @override
  String? get resultUrl;
  @override
  String? get errorMessage;
  @override
  int get goldCost;
  @override
  DateTime? get createdAt;

  /// Create a copy of AIProfileRequestResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AIProfileRequestResponseImplCopyWith<_$AIProfileRequestResponseImpl>
  get copyWith => throw _privateConstructorUsedError;
}
