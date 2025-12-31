// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'pet_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$PetModelImpl _$$PetModelImplFromJson(Map<String, dynamic> json) =>
    _$PetModelImpl(
      id: (json['id'] as num).toInt(),
      ownerId: (json['ownerId'] as num).toInt(),
      name: json['name'] as String,
      species: json['species'] as String,
      breed: json['breed'] as String?,
      gender: json['gender'] as String?,
      birthDate: json['birthDate'] as String?,
      weightKg: (json['weightKg'] as num?)?.toDouble(),
      isNeutered: json['isNeutered'] as bool?,
      profileImageUrl: json['profileImageUrl'] as String?,
      temperamentTags:
          (json['temperamentTags'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
    );

Map<String, dynamic> _$$PetModelImplToJson(_$PetModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'ownerId': instance.ownerId,
      'name': instance.name,
      'species': instance.species,
      'breed': instance.breed,
      'gender': instance.gender,
      'birthDate': instance.birthDate,
      'weightKg': instance.weightKg,
      'isNeutered': instance.isNeutered,
      'profileImageUrl': instance.profileImageUrl,
      'temperamentTags': instance.temperamentTags,
    };

_$SpeciesModelImpl _$$SpeciesModelImplFromJson(Map<String, dynamic> json) =>
    _$SpeciesModelImpl(
      id: (json['id'] as num).toInt(),
      code: json['code'] as String,
      name: json['name'] as String,
    );

Map<String, dynamic> _$$SpeciesModelImplToJson(_$SpeciesModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'code': instance.code,
      'name': instance.name,
    };

_$BreedModelImpl _$$BreedModelImplFromJson(Map<String, dynamic> json) =>
    _$BreedModelImpl(
      id: (json['id'] as num).toInt(),
      speciesId: (json['speciesId'] as num).toInt(),
      name: json['name'] as String,
    );

Map<String, dynamic> _$$BreedModelImplToJson(_$BreedModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'speciesId': instance.speciesId,
      'name': instance.name,
    };

_$CreatePetRequestImpl _$$CreatePetRequestImplFromJson(
  Map<String, dynamic> json,
) => _$CreatePetRequestImpl(
  name: json['name'] as String,
  speciesId: (json['speciesId'] as num).toInt(),
  breedId: (json['breedId'] as num?)?.toInt(),
  gender: json['gender'] as String?,
  birthDate: json['birthDate'] as String?,
  weightKg: (json['weightKg'] as num?)?.toDouble(),
  isNeutered: json['isNeutered'] as bool?,
  profileImageUrl: json['profileImageUrl'] as String?,
  temperamentTags: json['temperamentTags'] as String?,
);

Map<String, dynamic> _$$CreatePetRequestImplToJson(
  _$CreatePetRequestImpl instance,
) => <String, dynamic>{
  'name': instance.name,
  'speciesId': instance.speciesId,
  'breedId': instance.breedId,
  'gender': instance.gender,
  'birthDate': instance.birthDate,
  'weightKg': instance.weightKg,
  'isNeutered': instance.isNeutered,
  'profileImageUrl': instance.profileImageUrl,
  'temperamentTags': instance.temperamentTags,
};
