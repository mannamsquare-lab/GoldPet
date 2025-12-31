import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import 'pet_model.dart';

final petRepositoryProvider = Provider<PetRepository>((ref) {
  return PetRepository(ref.watch(apiClientProvider));
});

class PetRepository {
  final ApiClient _apiClient;

  PetRepository(this._apiClient);

  Future<List<SpeciesModel>> getSpecies() async {
    final response = await _apiClient.get('/api/v1/pets/species');
    final List<dynamic> list = response.data;
    return list.map((e) => SpeciesModel.fromJson(e)).toList();
  }

  Future<List<BreedModel>> getBreeds(int speciesId) async {
    final response = await _apiClient.get(
      '/api/v1/pets/breeds',
      queryParameters: {'speciesId': speciesId},
    );
    final List<dynamic> list = response.data;
    return list.map((e) => BreedModel.fromJson(e)).toList();
  }

  Future<void> createPet(CreatePetRequest request) async {
    await _apiClient.post('/api/v1/pets', data: request.toJson());
  }
}
