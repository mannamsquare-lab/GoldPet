// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'walk_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

WalkResponse _$WalkResponseFromJson(Map<String, dynamic> json) {
  return _WalkResponse.fromJson(json);
}

/// @nodoc
mixin _$WalkResponse {
  int get id => throw _privateConstructorUsedError;
  int get userId => throw _privateConstructorUsedError;
  DateTime get startTime => throw _privateConstructorUsedError;
  DateTime get endTime => throw _privateConstructorUsedError;
  double get distanceKm => throw _privateConstructorUsedError;
  int get durationSeconds =>
      throw _privateConstructorUsedError; // Path might be complicated to serialize from generic JSON to List<List<Double>>?
  // Geometry logic typically handled by backend. Response might return GeoJSON or simplified list.
  // Checking WalkResponse DTO in backend... assuming similar to request for now or simplified.
  // If backend returns LineString, custom converter needed.
  // For now, let's assume specific fields.
  double? get caloriesBurned => throw _privateConstructorUsedError;
  String? get notes => throw _privateConstructorUsedError;

  /// Serializes this WalkResponse to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of WalkResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $WalkResponseCopyWith<WalkResponse> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $WalkResponseCopyWith<$Res> {
  factory $WalkResponseCopyWith(
    WalkResponse value,
    $Res Function(WalkResponse) then,
  ) = _$WalkResponseCopyWithImpl<$Res, WalkResponse>;
  @useResult
  $Res call({
    int id,
    int userId,
    DateTime startTime,
    DateTime endTime,
    double distanceKm,
    int durationSeconds,
    double? caloriesBurned,
    String? notes,
  });
}

/// @nodoc
class _$WalkResponseCopyWithImpl<$Res, $Val extends WalkResponse>
    implements $WalkResponseCopyWith<$Res> {
  _$WalkResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of WalkResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? startTime = null,
    Object? endTime = null,
    Object? distanceKm = null,
    Object? durationSeconds = null,
    Object? caloriesBurned = freezed,
    Object? notes = freezed,
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
            startTime: null == startTime
                ? _value.startTime
                : startTime // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            endTime: null == endTime
                ? _value.endTime
                : endTime // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            distanceKm: null == distanceKm
                ? _value.distanceKm
                : distanceKm // ignore: cast_nullable_to_non_nullable
                      as double,
            durationSeconds: null == durationSeconds
                ? _value.durationSeconds
                : durationSeconds // ignore: cast_nullable_to_non_nullable
                      as int,
            caloriesBurned: freezed == caloriesBurned
                ? _value.caloriesBurned
                : caloriesBurned // ignore: cast_nullable_to_non_nullable
                      as double?,
            notes: freezed == notes
                ? _value.notes
                : notes // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$WalkResponseImplCopyWith<$Res>
    implements $WalkResponseCopyWith<$Res> {
  factory _$$WalkResponseImplCopyWith(
    _$WalkResponseImpl value,
    $Res Function(_$WalkResponseImpl) then,
  ) = __$$WalkResponseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    int userId,
    DateTime startTime,
    DateTime endTime,
    double distanceKm,
    int durationSeconds,
    double? caloriesBurned,
    String? notes,
  });
}

/// @nodoc
class __$$WalkResponseImplCopyWithImpl<$Res>
    extends _$WalkResponseCopyWithImpl<$Res, _$WalkResponseImpl>
    implements _$$WalkResponseImplCopyWith<$Res> {
  __$$WalkResponseImplCopyWithImpl(
    _$WalkResponseImpl _value,
    $Res Function(_$WalkResponseImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of WalkResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? startTime = null,
    Object? endTime = null,
    Object? distanceKm = null,
    Object? durationSeconds = null,
    Object? caloriesBurned = freezed,
    Object? notes = freezed,
  }) {
    return _then(
      _$WalkResponseImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        userId: null == userId
            ? _value.userId
            : userId // ignore: cast_nullable_to_non_nullable
                  as int,
        startTime: null == startTime
            ? _value.startTime
            : startTime // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        endTime: null == endTime
            ? _value.endTime
            : endTime // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        distanceKm: null == distanceKm
            ? _value.distanceKm
            : distanceKm // ignore: cast_nullable_to_non_nullable
                  as double,
        durationSeconds: null == durationSeconds
            ? _value.durationSeconds
            : durationSeconds // ignore: cast_nullable_to_non_nullable
                  as int,
        caloriesBurned: freezed == caloriesBurned
            ? _value.caloriesBurned
            : caloriesBurned // ignore: cast_nullable_to_non_nullable
                  as double?,
        notes: freezed == notes
            ? _value.notes
            : notes // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$WalkResponseImpl implements _WalkResponse {
  const _$WalkResponseImpl({
    required this.id,
    required this.userId,
    required this.startTime,
    required this.endTime,
    required this.distanceKm,
    required this.durationSeconds,
    this.caloriesBurned,
    this.notes,
  });

  factory _$WalkResponseImpl.fromJson(Map<String, dynamic> json) =>
      _$$WalkResponseImplFromJson(json);

  @override
  final int id;
  @override
  final int userId;
  @override
  final DateTime startTime;
  @override
  final DateTime endTime;
  @override
  final double distanceKm;
  @override
  final int durationSeconds;
  // Path might be complicated to serialize from generic JSON to List<List<Double>>?
  // Geometry logic typically handled by backend. Response might return GeoJSON or simplified list.
  // Checking WalkResponse DTO in backend... assuming similar to request for now or simplified.
  // If backend returns LineString, custom converter needed.
  // For now, let's assume specific fields.
  @override
  final double? caloriesBurned;
  @override
  final String? notes;

  @override
  String toString() {
    return 'WalkResponse(id: $id, userId: $userId, startTime: $startTime, endTime: $endTime, distanceKm: $distanceKm, durationSeconds: $durationSeconds, caloriesBurned: $caloriesBurned, notes: $notes)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$WalkResponseImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.startTime, startTime) ||
                other.startTime == startTime) &&
            (identical(other.endTime, endTime) || other.endTime == endTime) &&
            (identical(other.distanceKm, distanceKm) ||
                other.distanceKm == distanceKm) &&
            (identical(other.durationSeconds, durationSeconds) ||
                other.durationSeconds == durationSeconds) &&
            (identical(other.caloriesBurned, caloriesBurned) ||
                other.caloriesBurned == caloriesBurned) &&
            (identical(other.notes, notes) || other.notes == notes));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    userId,
    startTime,
    endTime,
    distanceKm,
    durationSeconds,
    caloriesBurned,
    notes,
  );

  /// Create a copy of WalkResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$WalkResponseImplCopyWith<_$WalkResponseImpl> get copyWith =>
      __$$WalkResponseImplCopyWithImpl<_$WalkResponseImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$WalkResponseImplToJson(this);
  }
}

abstract class _WalkResponse implements WalkResponse {
  const factory _WalkResponse({
    required final int id,
    required final int userId,
    required final DateTime startTime,
    required final DateTime endTime,
    required final double distanceKm,
    required final int durationSeconds,
    final double? caloriesBurned,
    final String? notes,
  }) = _$WalkResponseImpl;

  factory _WalkResponse.fromJson(Map<String, dynamic> json) =
      _$WalkResponseImpl.fromJson;

  @override
  int get id;
  @override
  int get userId;
  @override
  DateTime get startTime;
  @override
  DateTime get endTime;
  @override
  double get distanceKm;
  @override
  int get durationSeconds; // Path might be complicated to serialize from generic JSON to List<List<Double>>?
  // Geometry logic typically handled by backend. Response might return GeoJSON or simplified list.
  // Checking WalkResponse DTO in backend... assuming similar to request for now or simplified.
  // If backend returns LineString, custom converter needed.
  // For now, let's assume specific fields.
  @override
  double? get caloriesBurned;
  @override
  String? get notes;

  /// Create a copy of WalkResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$WalkResponseImplCopyWith<_$WalkResponseImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

CreateWalkRequest _$CreateWalkRequestFromJson(Map<String, dynamic> json) {
  return _CreateWalkRequest.fromJson(json);
}

/// @nodoc
mixin _$CreateWalkRequest {
  DateTime get startTime => throw _privateConstructorUsedError;
  DateTime get endTime => throw _privateConstructorUsedError;
  double get distanceKm => throw _privateConstructorUsedError;
  int get durationSeconds => throw _privateConstructorUsedError;
  List<List<double>> get path =>
      throw _privateConstructorUsedError; // [[lat, lon], [lat, lon]]
  double? get caloriesBurned => throw _privateConstructorUsedError;
  String? get notes => throw _privateConstructorUsedError;

  /// Serializes this CreateWalkRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CreateWalkRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CreateWalkRequestCopyWith<CreateWalkRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CreateWalkRequestCopyWith<$Res> {
  factory $CreateWalkRequestCopyWith(
    CreateWalkRequest value,
    $Res Function(CreateWalkRequest) then,
  ) = _$CreateWalkRequestCopyWithImpl<$Res, CreateWalkRequest>;
  @useResult
  $Res call({
    DateTime startTime,
    DateTime endTime,
    double distanceKm,
    int durationSeconds,
    List<List<double>> path,
    double? caloriesBurned,
    String? notes,
  });
}

/// @nodoc
class _$CreateWalkRequestCopyWithImpl<$Res, $Val extends CreateWalkRequest>
    implements $CreateWalkRequestCopyWith<$Res> {
  _$CreateWalkRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CreateWalkRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? startTime = null,
    Object? endTime = null,
    Object? distanceKm = null,
    Object? durationSeconds = null,
    Object? path = null,
    Object? caloriesBurned = freezed,
    Object? notes = freezed,
  }) {
    return _then(
      _value.copyWith(
            startTime: null == startTime
                ? _value.startTime
                : startTime // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            endTime: null == endTime
                ? _value.endTime
                : endTime // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            distanceKm: null == distanceKm
                ? _value.distanceKm
                : distanceKm // ignore: cast_nullable_to_non_nullable
                      as double,
            durationSeconds: null == durationSeconds
                ? _value.durationSeconds
                : durationSeconds // ignore: cast_nullable_to_non_nullable
                      as int,
            path: null == path
                ? _value.path
                : path // ignore: cast_nullable_to_non_nullable
                      as List<List<double>>,
            caloriesBurned: freezed == caloriesBurned
                ? _value.caloriesBurned
                : caloriesBurned // ignore: cast_nullable_to_non_nullable
                      as double?,
            notes: freezed == notes
                ? _value.notes
                : notes // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CreateWalkRequestImplCopyWith<$Res>
    implements $CreateWalkRequestCopyWith<$Res> {
  factory _$$CreateWalkRequestImplCopyWith(
    _$CreateWalkRequestImpl value,
    $Res Function(_$CreateWalkRequestImpl) then,
  ) = __$$CreateWalkRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    DateTime startTime,
    DateTime endTime,
    double distanceKm,
    int durationSeconds,
    List<List<double>> path,
    double? caloriesBurned,
    String? notes,
  });
}

/// @nodoc
class __$$CreateWalkRequestImplCopyWithImpl<$Res>
    extends _$CreateWalkRequestCopyWithImpl<$Res, _$CreateWalkRequestImpl>
    implements _$$CreateWalkRequestImplCopyWith<$Res> {
  __$$CreateWalkRequestImplCopyWithImpl(
    _$CreateWalkRequestImpl _value,
    $Res Function(_$CreateWalkRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CreateWalkRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? startTime = null,
    Object? endTime = null,
    Object? distanceKm = null,
    Object? durationSeconds = null,
    Object? path = null,
    Object? caloriesBurned = freezed,
    Object? notes = freezed,
  }) {
    return _then(
      _$CreateWalkRequestImpl(
        startTime: null == startTime
            ? _value.startTime
            : startTime // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        endTime: null == endTime
            ? _value.endTime
            : endTime // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        distanceKm: null == distanceKm
            ? _value.distanceKm
            : distanceKm // ignore: cast_nullable_to_non_nullable
                  as double,
        durationSeconds: null == durationSeconds
            ? _value.durationSeconds
            : durationSeconds // ignore: cast_nullable_to_non_nullable
                  as int,
        path: null == path
            ? _value._path
            : path // ignore: cast_nullable_to_non_nullable
                  as List<List<double>>,
        caloriesBurned: freezed == caloriesBurned
            ? _value.caloriesBurned
            : caloriesBurned // ignore: cast_nullable_to_non_nullable
                  as double?,
        notes: freezed == notes
            ? _value.notes
            : notes // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$CreateWalkRequestImpl implements _CreateWalkRequest {
  const _$CreateWalkRequestImpl({
    required this.startTime,
    required this.endTime,
    required this.distanceKm,
    required this.durationSeconds,
    required final List<List<double>> path,
    this.caloriesBurned,
    this.notes,
  }) : _path = path;

  factory _$CreateWalkRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$CreateWalkRequestImplFromJson(json);

  @override
  final DateTime startTime;
  @override
  final DateTime endTime;
  @override
  final double distanceKm;
  @override
  final int durationSeconds;
  final List<List<double>> _path;
  @override
  List<List<double>> get path {
    if (_path is EqualUnmodifiableListView) return _path;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_path);
  }

  // [[lat, lon], [lat, lon]]
  @override
  final double? caloriesBurned;
  @override
  final String? notes;

  @override
  String toString() {
    return 'CreateWalkRequest(startTime: $startTime, endTime: $endTime, distanceKm: $distanceKm, durationSeconds: $durationSeconds, path: $path, caloriesBurned: $caloriesBurned, notes: $notes)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CreateWalkRequestImpl &&
            (identical(other.startTime, startTime) ||
                other.startTime == startTime) &&
            (identical(other.endTime, endTime) || other.endTime == endTime) &&
            (identical(other.distanceKm, distanceKm) ||
                other.distanceKm == distanceKm) &&
            (identical(other.durationSeconds, durationSeconds) ||
                other.durationSeconds == durationSeconds) &&
            const DeepCollectionEquality().equals(other._path, _path) &&
            (identical(other.caloriesBurned, caloriesBurned) ||
                other.caloriesBurned == caloriesBurned) &&
            (identical(other.notes, notes) || other.notes == notes));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    startTime,
    endTime,
    distanceKm,
    durationSeconds,
    const DeepCollectionEquality().hash(_path),
    caloriesBurned,
    notes,
  );

  /// Create a copy of CreateWalkRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CreateWalkRequestImplCopyWith<_$CreateWalkRequestImpl> get copyWith =>
      __$$CreateWalkRequestImplCopyWithImpl<_$CreateWalkRequestImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$CreateWalkRequestImplToJson(this);
  }
}

abstract class _CreateWalkRequest implements CreateWalkRequest {
  const factory _CreateWalkRequest({
    required final DateTime startTime,
    required final DateTime endTime,
    required final double distanceKm,
    required final int durationSeconds,
    required final List<List<double>> path,
    final double? caloriesBurned,
    final String? notes,
  }) = _$CreateWalkRequestImpl;

  factory _CreateWalkRequest.fromJson(Map<String, dynamic> json) =
      _$CreateWalkRequestImpl.fromJson;

  @override
  DateTime get startTime;
  @override
  DateTime get endTime;
  @override
  double get distanceKm;
  @override
  int get durationSeconds;
  @override
  List<List<double>> get path; // [[lat, lon], [lat, lon]]
  @override
  double? get caloriesBurned;
  @override
  String? get notes;

  /// Create a copy of CreateWalkRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CreateWalkRequestImplCopyWith<_$CreateWalkRequestImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
