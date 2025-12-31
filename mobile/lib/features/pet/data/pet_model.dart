import 'package:freezed_annotation/freezed_annotation.dart';

part 'pet_model.freezed.dart';
part 'pet_model.g.dart';

@freezed
sealed class PetModel with _$PetModel {
  const factory PetModel({
    required int id,
    required int ownerId,
    required String name,
    required String species,
    String? breed,
    String? gender,
    String? birthDate, // LocalDate string
    double? weightKg,
    bool? isNeutered,
    String? profileImageUrl,
    @Default([]) List<String> temperamentTags,
  }) = _PetModel;

  factory PetModel.fromJson(Map<String, dynamic> json) =>
      _$PetModelFromJson(json);
}

@freezed
sealed class SpeciesModel with _$SpeciesModel {
  const factory SpeciesModel({
    required int id,
    required String code,
    required String name,
  }) = _SpeciesModel;

  factory SpeciesModel.fromJson(Map<String, dynamic> json) =>
      _$SpeciesModelFromJson(json);
}

@freezed
sealed class BreedModel with _$BreedModel {
  const factory BreedModel({
    required int id,
    required int speciesId,
    required String name,
  }) = _BreedModel;

  factory BreedModel.fromJson(Map<String, dynamic> json) =>
      _$BreedModelFromJson(json);
}

@freezed
sealed class CreatePetRequest with _$CreatePetRequest {
  const factory CreatePetRequest({
    required String name,
    required int speciesId,
    int? breedId,
    String? gender,
    String? birthDate,
    double? weightKg,
    bool? isNeutered,
    String? profileImageUrl,
    String? temperamentTags,
  }) = _CreatePetRequest;

  factory CreatePetRequest.fromJson(Map<String, dynamic> json) =>
      _$CreatePetRequestFromJson(json);
}
