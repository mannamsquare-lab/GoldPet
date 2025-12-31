import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/pet_model.dart';
import '../data/pet_repository.dart';

part 'pet_registration_provider.g.dart';

class PetRegistrationState {
  final List<SpeciesModel> speciesList;
  final List<BreedModel> breedsList;
  final SpeciesModel? selectedSpecies;
  final BreedModel? selectedBreed;
  final bool isSuccess;

  const PetRegistrationState({
    this.speciesList = const [],
    this.breedsList = const [],
    this.selectedSpecies,
    this.selectedBreed,
    this.isSuccess = false,
  });

  PetRegistrationState copyWith({
    List<SpeciesModel>? speciesList,
    List<BreedModel>? breedsList,
    SpeciesModel? selectedSpecies,
    BreedModel? selectedBreed,
    bool? isSuccess,
  }) {
    return PetRegistrationState(
      speciesList: speciesList ?? this.speciesList,
      breedsList: breedsList ?? this.breedsList,
      selectedSpecies: selectedSpecies ?? this.selectedSpecies,
      selectedBreed: selectedBreed ?? this.selectedBreed,
      isSuccess: isSuccess ?? this.isSuccess,
    );
  }
}

@riverpod
class PetRegistration extends _$PetRegistration {
  @override
  FutureOr<PetRegistrationState> build() async {
    final repository = ref.watch(petRepositoryProvider);
    final species = await repository.getSpecies();
    return PetRegistrationState(speciesList: species);
  }

  Future<void> selectSpecies(SpeciesModel species) async {
    final currentState = state.value;
    if (currentState == null) return;
    if (currentState.selectedSpecies == species) return;

    state = AsyncValue.data(
      currentState.copyWith(
        selectedSpecies: species,
        selectedBreed: null,
        breedsList: [],
      ),
    );

    state = const AsyncValue.loading();
    state = AsyncValue.data(
      currentState.copyWith(
        selectedSpecies: species,
        selectedBreed: null,
        breedsList: [],
      ),
    );

    final repository = ref.read(petRepositoryProvider);
    try {
      final breeds = await repository.getBreeds(species.id);
      state = AsyncValue.data(state.value!.copyWith(breedsList: breeds));
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  void selectBreed(BreedModel? breed) {
    if (state.value == null) return;
    state = AsyncValue.data(state.value!.copyWith(selectedBreed: breed));
  }

  Future<void> submit({
    required String name,
    required String gender,
    required String birthDate,
    required double weightKg,
    required bool isNeutered,
  }) async {
    final currentState = state.value;
    if (currentState == null || currentState.selectedSpecies == null) {
      return;
    }

    state = const AsyncValue.loading();

    final repository = ref.read(petRepositoryProvider);
    final request = CreatePetRequest(
      name: name,
      speciesId: currentState.selectedSpecies!.id,
      breedId: currentState.selectedBreed?.id,
      gender: gender,
      birthDate: birthDate,
      weightKg: weightKg,
      isNeutered: isNeutered,
      profileImageUrl: null,
      temperamentTags: null,
    );

    try {
      await repository.createPet(request);
      state = AsyncValue.data(currentState.copyWith(isSuccess: true));
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}
