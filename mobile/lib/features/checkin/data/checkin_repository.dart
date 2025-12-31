import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import 'checkin_models.dart';

final checkInRepositoryProvider = Provider<CheckInRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return CheckInRepository(apiClient);
});

class CheckInRepository {
  final ApiClient _apiClient;

  CheckInRepository(this._apiClient);

  Future<List<PlaceResponse>> getNearbyPlaces(
    NearbyPlaceRequest request,
  ) async {
    final response = await _apiClient.get(
      '/v1/checkin/places/nearby',
      queryParameters: request.toJson(),
    );
    return (response.data as List)
        .map((e) => PlaceResponse.fromJson(e))
        .toList();
  }

  Future<List<PlaceResponse>> getPlaces({
    PlaceCategory? category,
    int page = 0,
    int size = 20,
  }) async {
    final response = await _apiClient.get(
      '/v1/checkin/places',
      queryParameters: {
        if (category != null) 'category': category.name,
        'page': page,
        'size': size,
      },
    );
    final content = response.data['content'] as List;
    return content.map((e) => PlaceResponse.fromJson(e)).toList();
  }

  Future<CheckInResponse> checkIn(CreateCheckInRequest request) async {
    final response = await _apiClient.post(
      '/v1/checkin',
      data: request.toJson(),
    );
    return CheckInResponse.fromJson(response.data);
  }

  Future<List<CheckInResponse>> getMyCheckIns({
    int page = 0,
    int size = 20,
  }) async {
    final response = await _apiClient.get(
      '/v1/checkin/my',
      queryParameters: {'page': page, 'size': size},
    );
    final content = response.data['content'] as List;
    return content.map((e) => CheckInResponse.fromJson(e)).toList();
  }
}
