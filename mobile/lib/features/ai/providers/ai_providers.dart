import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../data/ai_models.dart';
import '../data/ai_repository.dart';

part 'ai_providers.g.dart';

@riverpod
Future<List<AIStyleOption>> aiStyles(Ref ref) async {
  return ref.watch(aiRepositoryProvider).getStyles();
}

@riverpod
class AiRequests extends _$AiRequests {
  @override
  Future<List<AIProfileRequestResponse>> build() async {
    return ref.watch(aiRepositoryProvider).getMyRequests();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      return ref.read(aiRepositoryProvider).getMyRequests();
    });
  }
}

@riverpod
class AiController extends _$AiController {
  @override
  FutureOr<void> build() {
    // no-op
  }

  Future<void> createRequest({
    required int petId,
    required AIRequestType type,
    required String sourceImageUrl,
    String? stylePrompt,
  }) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await ref
          .read(aiRepositoryProvider)
          .createRequest(
            CreateAIProfileRequest(
              petId: petId,
              type: type,
              sourceImageUrl: sourceImageUrl,
              stylePrompt: stylePrompt,
            ),
          );
      ref.invalidate(aiRequestsProvider);
    });
  }

  Future<void> cancelRequest(int requestId) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await ref.read(aiRepositoryProvider).cancelRequest(requestId);
      ref.invalidate(aiRequestsProvider);
    });
  }
}
