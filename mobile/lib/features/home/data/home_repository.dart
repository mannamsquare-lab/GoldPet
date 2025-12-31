import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../user/data/user_model.dart';
import '../../pet/data/pet_model.dart';

final homeRepositoryProvider = Provider<HomeRepository>((ref) {
  return HomeRepository(ref.watch(apiClientProvider));
});

class HomeRepository {
  final ApiClient _apiClient;

  HomeRepository(this._apiClient);

  Future<UserModel> getMyProfile() async {
    final response = await _apiClient.get('/api/v1/users/me');
    return UserModel.fromJson(response.data);
  }

  Future<List<PetModel>> getMyPets() async {
    final response = await _apiClient.get('/api/v1/pets/my');
    final List<dynamic> list = response.data;
    return list.map((e) => PetModel.fromJson(e)).toList();
  }
}
