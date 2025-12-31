import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../data/checkin_models.dart';
import '../data/checkin_repository.dart';

part 'checkin_providers.g.dart';

@riverpod
Future<List<PlaceResponse>> nearbyPlaces(
  Ref ref, {
  required double lat,
  required double lng,
  double radius = 1000.0,
}) async {
  return ref
      .watch(checkInRepositoryProvider)
      .getNearbyPlaces(
        NearbyPlaceRequest(latitude: lat, longitude: lng, radiusMeters: radius),
      );
}

@riverpod
class CheckInController extends _$CheckInController {
  @override
  FutureOr<void> build() {
    // no-op
  }

  Future<void> checkIn({
    required int placeId,
    String? photoUrl,
    String? memo,
  }) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await ref
          .read(checkInRepositoryProvider)
          .checkIn(
            CreateCheckInRequest(
              placeId: placeId,
              photoUrl: photoUrl,
              memo: memo,
            ),
          );
      // Optional: Refresh some providers if needed
    });
  }
}
