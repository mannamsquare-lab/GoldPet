// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'pet_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

PetModel _$PetModelFromJson(Map<String, dynamic> json) {
  return _PetModel.fromJson(json);
}

/// @nodoc
mixin _$PetModel {
  int get id => throw _privateConstructorUsedError;
  int get ownerId => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get species => throw _privateConstructorUsedError;
  String? get breed => throw _privateConstructorUsedError;
  String? get gender => throw _privateConstructorUsedError;
  String? get birthDate =>
      throw _privateConstructorUsedError; // LocalDate string
  double? get weightKg => throw _privateConstructorUsedError;
  bool? get isNeutered => throw _privateConstructorUsedError;
  String? get profileImageUrl => throw _privateConstructorUsedError;
  List<String> get temperamentTags => throw _privateConstructorUsedError;

  /// Serializes this PetModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of PetModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $PetModelCopyWith<PetModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PetModelCopyWith<$Res> {
  factory $PetModelCopyWith(PetModel value, $Res Function(PetModel) then) =
      _$PetModelCopyWithImpl<$Res, PetModel>;
  @useResult
  $Res call({
    int id,
    int ownerId,
    String name,
    String species,
    String? breed,
    String? gender,
    String? birthDate,
    double? weightKg,
    bool? isNeutered,
    String? profileImageUrl,
    List<String> temperamentTags,
  });
}

/// @nodoc
class _$PetModelCopyWithImpl<$Res, $Val extends PetModel>
    implements $PetModelCopyWith<$Res> {
  _$PetModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of PetModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? ownerId = null,
    Object? name = null,
    Object? species = null,
    Object? breed = freezed,
    Object? gender = freezed,
    Object? birthDate = freezed,
    Object? weightKg = freezed,
    Object? isNeutered = freezed,
    Object? profileImageUrl = freezed,
    Object? temperamentTags = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            ownerId: null == ownerId
                ? _value.ownerId
                : ownerId // ignore: cast_nullable_to_non_nullable
                      as int,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            species: null == species
                ? _value.species
                : species // ignore: cast_nullable_to_non_nullable
                      as String,
            breed: freezed == breed
                ? _value.breed
                : breed // ignore: cast_nullable_to_non_nullable
                      as String?,
            gender: freezed == gender
                ? _value.gender
                : gender // ignore: cast_nullable_to_non_nullable
                      as String?,
            birthDate: freezed == birthDate
                ? _value.birthDate
                : birthDate // ignore: cast_nullable_to_non_nullable
                      as String?,
            weightKg: freezed == weightKg
                ? _value.weightKg
                : weightKg // ignore: cast_nullable_to_non_nullable
                      as double?,
            isNeutered: freezed == isNeutered
                ? _value.isNeutered
                : isNeutered // ignore: cast_nullable_to_non_nullable
                      as bool?,
            profileImageUrl: freezed == profileImageUrl
                ? _value.profileImageUrl
                : profileImageUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
            temperamentTags: null == temperamentTags
                ? _value.temperamentTags
                : temperamentTags // ignore: cast_nullable_to_non_nullable
                      as List<String>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$PetModelImplCopyWith<$Res>
    implements $PetModelCopyWith<$Res> {
  factory _$$PetModelImplCopyWith(
    _$PetModelImpl value,
    $Res Function(_$PetModelImpl) then,
  ) = __$$PetModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    int ownerId,
    String name,
    String species,
    String? breed,
    String? gender,
    String? birthDate,
    double? weightKg,
    bool? isNeutered,
    String? profileImageUrl,
    List<String> temperamentTags,
  });
}

/// @nodoc
class __$$PetModelImplCopyWithImpl<$Res>
    extends _$PetModelCopyWithImpl<$Res, _$PetModelImpl>
    implements _$$PetModelImplCopyWith<$Res> {
  __$$PetModelImplCopyWithImpl(
    _$PetModelImpl _value,
    $Res Function(_$PetModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of PetModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? ownerId = null,
    Object? name = null,
    Object? species = null,
    Object? breed = freezed,
    Object? gender = freezed,
    Object? birthDate = freezed,
    Object? weightKg = freezed,
    Object? isNeutered = freezed,
    Object? profileImageUrl = freezed,
    Object? temperamentTags = null,
  }) {
    return _then(
      _$PetModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        ownerId: null == ownerId
            ? _value.ownerId
            : ownerId // ignore: cast_nullable_to_non_nullable
                  as int,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        species: null == species
            ? _value.species
            : species // ignore: cast_nullable_to_non_nullable
                  as String,
        breed: freezed == breed
            ? _value.breed
            : breed // ignore: cast_nullable_to_non_nullable
                  as String?,
        gender: freezed == gender
            ? _value.gender
            : gender // ignore: cast_nullable_to_non_nullable
                  as String?,
        birthDate: freezed == birthDate
            ? _value.birthDate
            : birthDate // ignore: cast_nullable_to_non_nullable
                  as String?,
        weightKg: freezed == weightKg
            ? _value.weightKg
            : weightKg // ignore: cast_nullable_to_non_nullable
                  as double?,
        isNeutered: freezed == isNeutered
            ? _value.isNeutered
            : isNeutered // ignore: cast_nullable_to_non_nullable
                  as bool?,
        profileImageUrl: freezed == profileImageUrl
            ? _value.profileImageUrl
            : profileImageUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
        temperamentTags: null == temperamentTags
            ? _value._temperamentTags
            : temperamentTags // ignore: cast_nullable_to_non_nullable
                  as List<String>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$PetModelImpl implements _PetModel {
  const _$PetModelImpl({
    required this.id,
    required this.ownerId,
    required this.name,
    required this.species,
    this.breed,
    this.gender,
    this.birthDate,
    this.weightKg,
    this.isNeutered,
    this.profileImageUrl,
    final List<String> temperamentTags = const [],
  }) : _temperamentTags = temperamentTags;

  factory _$PetModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$PetModelImplFromJson(json);

  @override
  final int id;
  @override
  final int ownerId;
  @override
  final String name;
  @override
  final String species;
  @override
  final String? breed;
  @override
  final String? gender;
  @override
  final String? birthDate;
  // LocalDate string
  @override
  final double? weightKg;
  @override
  final bool? isNeutered;
  @override
  final String? profileImageUrl;
  final List<String> _temperamentTags;
  @override
  @JsonKey()
  List<String> get temperamentTags {
    if (_temperamentTags is EqualUnmodifiableListView) return _temperamentTags;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_temperamentTags);
  }

  @override
  String toString() {
    return 'PetModel(id: $id, ownerId: $ownerId, name: $name, species: $species, breed: $breed, gender: $gender, birthDate: $birthDate, weightKg: $weightKg, isNeutered: $isNeutered, profileImageUrl: $profileImageUrl, temperamentTags: $temperamentTags)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PetModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.ownerId, ownerId) || other.ownerId == ownerId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.species, species) || other.species == species) &&
            (identical(other.breed, breed) || other.breed == breed) &&
            (identical(other.gender, gender) || other.gender == gender) &&
            (identical(other.birthDate, birthDate) ||
                other.birthDate == birthDate) &&
            (identical(other.weightKg, weightKg) ||
                other.weightKg == weightKg) &&
            (identical(other.isNeutered, isNeutered) ||
                other.isNeutered == isNeutered) &&
            (identical(other.profileImageUrl, profileImageUrl) ||
                other.profileImageUrl == profileImageUrl) &&
            const DeepCollectionEquality().equals(
              other._temperamentTags,
              _temperamentTags,
            ));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    ownerId,
    name,
    species,
    breed,
    gender,
    birthDate,
    weightKg,
    isNeutered,
    profileImageUrl,
    const DeepCollectionEquality().hash(_temperamentTags),
  );

  /// Create a copy of PetModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$PetModelImplCopyWith<_$PetModelImpl> get copyWith =>
      __$$PetModelImplCopyWithImpl<_$PetModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$PetModelImplToJson(this);
  }
}

abstract class _PetModel implements PetModel {
  const factory _PetModel({
    required final int id,
    required final int ownerId,
    required final String name,
    required final String species,
    final String? breed,
    final String? gender,
    final String? birthDate,
    final double? weightKg,
    final bool? isNeutered,
    final String? profileImageUrl,
    final List<String> temperamentTags,
  }) = _$PetModelImpl;

  factory _PetModel.fromJson(Map<String, dynamic> json) =
      _$PetModelImpl.fromJson;

  @override
  int get id;
  @override
  int get ownerId;
  @override
  String get name;
  @override
  String get species;
  @override
  String? get breed;
  @override
  String? get gender;
  @override
  String? get birthDate; // LocalDate string
  @override
  double? get weightKg;
  @override
  bool? get isNeutered;
  @override
  String? get profileImageUrl;
  @override
  List<String> get temperamentTags;

  /// Create a copy of PetModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$PetModelImplCopyWith<_$PetModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

SpeciesModel _$SpeciesModelFromJson(Map<String, dynamic> json) {
  return _SpeciesModel.fromJson(json);
}

/// @nodoc
mixin _$SpeciesModel {
  int get id => throw _privateConstructorUsedError;
  String get code => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;

  /// Serializes this SpeciesModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of SpeciesModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SpeciesModelCopyWith<SpeciesModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SpeciesModelCopyWith<$Res> {
  factory $SpeciesModelCopyWith(
    SpeciesModel value,
    $Res Function(SpeciesModel) then,
  ) = _$SpeciesModelCopyWithImpl<$Res, SpeciesModel>;
  @useResult
  $Res call({int id, String code, String name});
}

/// @nodoc
class _$SpeciesModelCopyWithImpl<$Res, $Val extends SpeciesModel>
    implements $SpeciesModelCopyWith<$Res> {
  _$SpeciesModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of SpeciesModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? id = null, Object? code = null, Object? name = null}) {
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
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$SpeciesModelImplCopyWith<$Res>
    implements $SpeciesModelCopyWith<$Res> {
  factory _$$SpeciesModelImplCopyWith(
    _$SpeciesModelImpl value,
    $Res Function(_$SpeciesModelImpl) then,
  ) = __$$SpeciesModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int id, String code, String name});
}

/// @nodoc
class __$$SpeciesModelImplCopyWithImpl<$Res>
    extends _$SpeciesModelCopyWithImpl<$Res, _$SpeciesModelImpl>
    implements _$$SpeciesModelImplCopyWith<$Res> {
  __$$SpeciesModelImplCopyWithImpl(
    _$SpeciesModelImpl _value,
    $Res Function(_$SpeciesModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of SpeciesModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? id = null, Object? code = null, Object? name = null}) {
    return _then(
      _$SpeciesModelImpl(
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
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$SpeciesModelImpl implements _SpeciesModel {
  const _$SpeciesModelImpl({
    required this.id,
    required this.code,
    required this.name,
  });

  factory _$SpeciesModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$SpeciesModelImplFromJson(json);

  @override
  final int id;
  @override
  final String code;
  @override
  final String name;

  @override
  String toString() {
    return 'SpeciesModel(id: $id, code: $code, name: $name)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SpeciesModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.code, code) || other.code == code) &&
            (identical(other.name, name) || other.name == name));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, code, name);

  /// Create a copy of SpeciesModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SpeciesModelImplCopyWith<_$SpeciesModelImpl> get copyWith =>
      __$$SpeciesModelImplCopyWithImpl<_$SpeciesModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SpeciesModelImplToJson(this);
  }
}

abstract class _SpeciesModel implements SpeciesModel {
  const factory _SpeciesModel({
    required final int id,
    required final String code,
    required final String name,
  }) = _$SpeciesModelImpl;

  factory _SpeciesModel.fromJson(Map<String, dynamic> json) =
      _$SpeciesModelImpl.fromJson;

  @override
  int get id;
  @override
  String get code;
  @override
  String get name;

  /// Create a copy of SpeciesModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SpeciesModelImplCopyWith<_$SpeciesModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

BreedModel _$BreedModelFromJson(Map<String, dynamic> json) {
  return _BreedModel.fromJson(json);
}

/// @nodoc
mixin _$BreedModel {
  int get id => throw _privateConstructorUsedError;
  int get speciesId => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;

  /// Serializes this BreedModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of BreedModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $BreedModelCopyWith<BreedModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $BreedModelCopyWith<$Res> {
  factory $BreedModelCopyWith(
    BreedModel value,
    $Res Function(BreedModel) then,
  ) = _$BreedModelCopyWithImpl<$Res, BreedModel>;
  @useResult
  $Res call({int id, int speciesId, String name});
}

/// @nodoc
class _$BreedModelCopyWithImpl<$Res, $Val extends BreedModel>
    implements $BreedModelCopyWith<$Res> {
  _$BreedModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of BreedModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? speciesId = null,
    Object? name = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            speciesId: null == speciesId
                ? _value.speciesId
                : speciesId // ignore: cast_nullable_to_non_nullable
                      as int,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$BreedModelImplCopyWith<$Res>
    implements $BreedModelCopyWith<$Res> {
  factory _$$BreedModelImplCopyWith(
    _$BreedModelImpl value,
    $Res Function(_$BreedModelImpl) then,
  ) = __$$BreedModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int id, int speciesId, String name});
}

/// @nodoc
class __$$BreedModelImplCopyWithImpl<$Res>
    extends _$BreedModelCopyWithImpl<$Res, _$BreedModelImpl>
    implements _$$BreedModelImplCopyWith<$Res> {
  __$$BreedModelImplCopyWithImpl(
    _$BreedModelImpl _value,
    $Res Function(_$BreedModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of BreedModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? speciesId = null,
    Object? name = null,
  }) {
    return _then(
      _$BreedModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        speciesId: null == speciesId
            ? _value.speciesId
            : speciesId // ignore: cast_nullable_to_non_nullable
                  as int,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$BreedModelImpl implements _BreedModel {
  const _$BreedModelImpl({
    required this.id,
    required this.speciesId,
    required this.name,
  });

  factory _$BreedModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$BreedModelImplFromJson(json);

  @override
  final int id;
  @override
  final int speciesId;
  @override
  final String name;

  @override
  String toString() {
    return 'BreedModel(id: $id, speciesId: $speciesId, name: $name)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$BreedModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.speciesId, speciesId) ||
                other.speciesId == speciesId) &&
            (identical(other.name, name) || other.name == name));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, speciesId, name);

  /// Create a copy of BreedModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$BreedModelImplCopyWith<_$BreedModelImpl> get copyWith =>
      __$$BreedModelImplCopyWithImpl<_$BreedModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$BreedModelImplToJson(this);
  }
}

abstract class _BreedModel implements BreedModel {
  const factory _BreedModel({
    required final int id,
    required final int speciesId,
    required final String name,
  }) = _$BreedModelImpl;

  factory _BreedModel.fromJson(Map<String, dynamic> json) =
      _$BreedModelImpl.fromJson;

  @override
  int get id;
  @override
  int get speciesId;
  @override
  String get name;

  /// Create a copy of BreedModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$BreedModelImplCopyWith<_$BreedModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

CreatePetRequest _$CreatePetRequestFromJson(Map<String, dynamic> json) {
  return _CreatePetRequest.fromJson(json);
}

/// @nodoc
mixin _$CreatePetRequest {
  String get name => throw _privateConstructorUsedError;
  int get speciesId => throw _privateConstructorUsedError;
  int? get breedId => throw _privateConstructorUsedError;
  String? get gender => throw _privateConstructorUsedError;
  String? get birthDate => throw _privateConstructorUsedError;
  double? get weightKg => throw _privateConstructorUsedError;
  bool? get isNeutered => throw _privateConstructorUsedError;
  String? get profileImageUrl => throw _privateConstructorUsedError;
  String? get temperamentTags => throw _privateConstructorUsedError;

  /// Serializes this CreatePetRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CreatePetRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CreatePetRequestCopyWith<CreatePetRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CreatePetRequestCopyWith<$Res> {
  factory $CreatePetRequestCopyWith(
    CreatePetRequest value,
    $Res Function(CreatePetRequest) then,
  ) = _$CreatePetRequestCopyWithImpl<$Res, CreatePetRequest>;
  @useResult
  $Res call({
    String name,
    int speciesId,
    int? breedId,
    String? gender,
    String? birthDate,
    double? weightKg,
    bool? isNeutered,
    String? profileImageUrl,
    String? temperamentTags,
  });
}

/// @nodoc
class _$CreatePetRequestCopyWithImpl<$Res, $Val extends CreatePetRequest>
    implements $CreatePetRequestCopyWith<$Res> {
  _$CreatePetRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CreatePetRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = null,
    Object? speciesId = null,
    Object? breedId = freezed,
    Object? gender = freezed,
    Object? birthDate = freezed,
    Object? weightKg = freezed,
    Object? isNeutered = freezed,
    Object? profileImageUrl = freezed,
    Object? temperamentTags = freezed,
  }) {
    return _then(
      _value.copyWith(
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            speciesId: null == speciesId
                ? _value.speciesId
                : speciesId // ignore: cast_nullable_to_non_nullable
                      as int,
            breedId: freezed == breedId
                ? _value.breedId
                : breedId // ignore: cast_nullable_to_non_nullable
                      as int?,
            gender: freezed == gender
                ? _value.gender
                : gender // ignore: cast_nullable_to_non_nullable
                      as String?,
            birthDate: freezed == birthDate
                ? _value.birthDate
                : birthDate // ignore: cast_nullable_to_non_nullable
                      as String?,
            weightKg: freezed == weightKg
                ? _value.weightKg
                : weightKg // ignore: cast_nullable_to_non_nullable
                      as double?,
            isNeutered: freezed == isNeutered
                ? _value.isNeutered
                : isNeutered // ignore: cast_nullable_to_non_nullable
                      as bool?,
            profileImageUrl: freezed == profileImageUrl
                ? _value.profileImageUrl
                : profileImageUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
            temperamentTags: freezed == temperamentTags
                ? _value.temperamentTags
                : temperamentTags // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CreatePetRequestImplCopyWith<$Res>
    implements $CreatePetRequestCopyWith<$Res> {
  factory _$$CreatePetRequestImplCopyWith(
    _$CreatePetRequestImpl value,
    $Res Function(_$CreatePetRequestImpl) then,
  ) = __$$CreatePetRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String name,
    int speciesId,
    int? breedId,
    String? gender,
    String? birthDate,
    double? weightKg,
    bool? isNeutered,
    String? profileImageUrl,
    String? temperamentTags,
  });
}

/// @nodoc
class __$$CreatePetRequestImplCopyWithImpl<$Res>
    extends _$CreatePetRequestCopyWithImpl<$Res, _$CreatePetRequestImpl>
    implements _$$CreatePetRequestImplCopyWith<$Res> {
  __$$CreatePetRequestImplCopyWithImpl(
    _$CreatePetRequestImpl _value,
    $Res Function(_$CreatePetRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CreatePetRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = null,
    Object? speciesId = null,
    Object? breedId = freezed,
    Object? gender = freezed,
    Object? birthDate = freezed,
    Object? weightKg = freezed,
    Object? isNeutered = freezed,
    Object? profileImageUrl = freezed,
    Object? temperamentTags = freezed,
  }) {
    return _then(
      _$CreatePetRequestImpl(
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        speciesId: null == speciesId
            ? _value.speciesId
            : speciesId // ignore: cast_nullable_to_non_nullable
                  as int,
        breedId: freezed == breedId
            ? _value.breedId
            : breedId // ignore: cast_nullable_to_non_nullable
                  as int?,
        gender: freezed == gender
            ? _value.gender
            : gender // ignore: cast_nullable_to_non_nullable
                  as String?,
        birthDate: freezed == birthDate
            ? _value.birthDate
            : birthDate // ignore: cast_nullable_to_non_nullable
                  as String?,
        weightKg: freezed == weightKg
            ? _value.weightKg
            : weightKg // ignore: cast_nullable_to_non_nullable
                  as double?,
        isNeutered: freezed == isNeutered
            ? _value.isNeutered
            : isNeutered // ignore: cast_nullable_to_non_nullable
                  as bool?,
        profileImageUrl: freezed == profileImageUrl
            ? _value.profileImageUrl
            : profileImageUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
        temperamentTags: freezed == temperamentTags
            ? _value.temperamentTags
            : temperamentTags // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$CreatePetRequestImpl implements _CreatePetRequest {
  const _$CreatePetRequestImpl({
    required this.name,
    required this.speciesId,
    this.breedId,
    this.gender,
    this.birthDate,
    this.weightKg,
    this.isNeutered,
    this.profileImageUrl,
    this.temperamentTags,
  });

  factory _$CreatePetRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$CreatePetRequestImplFromJson(json);

  @override
  final String name;
  @override
  final int speciesId;
  @override
  final int? breedId;
  @override
  final String? gender;
  @override
  final String? birthDate;
  @override
  final double? weightKg;
  @override
  final bool? isNeutered;
  @override
  final String? profileImageUrl;
  @override
  final String? temperamentTags;

  @override
  String toString() {
    return 'CreatePetRequest(name: $name, speciesId: $speciesId, breedId: $breedId, gender: $gender, birthDate: $birthDate, weightKg: $weightKg, isNeutered: $isNeutered, profileImageUrl: $profileImageUrl, temperamentTags: $temperamentTags)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CreatePetRequestImpl &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.speciesId, speciesId) ||
                other.speciesId == speciesId) &&
            (identical(other.breedId, breedId) || other.breedId == breedId) &&
            (identical(other.gender, gender) || other.gender == gender) &&
            (identical(other.birthDate, birthDate) ||
                other.birthDate == birthDate) &&
            (identical(other.weightKg, weightKg) ||
                other.weightKg == weightKg) &&
            (identical(other.isNeutered, isNeutered) ||
                other.isNeutered == isNeutered) &&
            (identical(other.profileImageUrl, profileImageUrl) ||
                other.profileImageUrl == profileImageUrl) &&
            (identical(other.temperamentTags, temperamentTags) ||
                other.temperamentTags == temperamentTags));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    name,
    speciesId,
    breedId,
    gender,
    birthDate,
    weightKg,
    isNeutered,
    profileImageUrl,
    temperamentTags,
  );

  /// Create a copy of CreatePetRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CreatePetRequestImplCopyWith<_$CreatePetRequestImpl> get copyWith =>
      __$$CreatePetRequestImplCopyWithImpl<_$CreatePetRequestImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$CreatePetRequestImplToJson(this);
  }
}

abstract class _CreatePetRequest implements CreatePetRequest {
  const factory _CreatePetRequest({
    required final String name,
    required final int speciesId,
    final int? breedId,
    final String? gender,
    final String? birthDate,
    final double? weightKg,
    final bool? isNeutered,
    final String? profileImageUrl,
    final String? temperamentTags,
  }) = _$CreatePetRequestImpl;

  factory _CreatePetRequest.fromJson(Map<String, dynamic> json) =
      _$CreatePetRequestImpl.fromJson;

  @override
  String get name;
  @override
  int get speciesId;
  @override
  int? get breedId;
  @override
  String? get gender;
  @override
  String? get birthDate;
  @override
  double? get weightKg;
  @override
  bool? get isNeutered;
  @override
  String? get profileImageUrl;
  @override
  String? get temperamentTags;

  /// Create a copy of CreatePetRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CreatePetRequestImplCopyWith<_$CreatePetRequestImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
