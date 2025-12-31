import 'package:freezed_annotation/freezed_annotation.dart';

part 'walk_models.freezed.dart';
part 'walk_models.g.dart';

@freezed
sealed class WalkResponse with _$WalkResponse {
  const factory WalkResponse({
    required int id,
    required int userId,
    required DateTime startTime,
    required DateTime endTime,
    required double distanceKm,
    required int durationSeconds,
    // Path might be complicated to serialize from generic JSON to List<List<Double>>?
    // Geometry logic typically handled by backend. Response might return GeoJSON or simplified list.
    // Checking WalkResponse DTO in backend... assuming similar to request for now or simplified.
    // If backend returns LineString, custom converter needed.
    // For now, let's assume specific fields.
    double? caloriesBurned,
    String? notes,
  }) = _WalkResponse;

  factory WalkResponse.fromJson(Map<String, dynamic> json) =>
      _$WalkResponseFromJson(json);
}

@freezed
sealed class CreateWalkRequest with _$CreateWalkRequest {
  const factory CreateWalkRequest({
    required DateTime startTime,
    required DateTime endTime,
    required double distanceKm,
    required int durationSeconds,
    required List<List<double>> path, // [[lat, lon], [lat, lon]]
    double? caloriesBurned,
    String? notes,
  }) = _CreateWalkRequest;

  factory CreateWalkRequest.fromJson(Map<String, dynamic> json) =>
      _$CreateWalkRequestFromJson(json);
}
