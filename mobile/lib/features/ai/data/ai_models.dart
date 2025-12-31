import 'package:freezed_annotation/freezed_annotation.dart';

part 'ai_models.freezed.dart';
part 'ai_models.g.dart';

enum AIRequestType { IMAGE, VIDEO }

enum AIRequestStatus { REQUESTED, PROCESSING, COMPLETED, FAILED, CANCELLED }

@freezed
sealed class AIStyleOption with _$AIStyleOption {
  const factory AIStyleOption({
    required String id,
    required String name,
    required String description,
    required String previewUrl,
    required int goldCost,
  }) = _AIStyleOption;

  factory AIStyleOption.fromJson(Map<String, dynamic> json) =>
      _$AIStyleOptionFromJson(json);
}

@freezed
sealed class CreateAIProfileRequest with _$CreateAIProfileRequest {
  const factory CreateAIProfileRequest({
    required int petId,
    required AIRequestType type,
    required String sourceImageUrl,
    String? stylePrompt,
  }) = _CreateAIProfileRequest;

  factory CreateAIProfileRequest.fromJson(Map<String, dynamic> json) =>
      _$CreateAIProfileRequestFromJson(json);
}

@freezed
sealed class AIProfileRequestResponse with _$AIProfileRequestResponse {
  const factory AIProfileRequestResponse({
    required int id,
    required int petId,
    required String petName,
    required AIRequestType type,
    required String sourceImageUrl,
    String? stylePrompt,
    required AIRequestStatus status,
    String? resultUrl,
    String? errorMessage,
    required int goldCost,
    DateTime? createdAt,
  }) = _AIProfileRequestResponse;

  factory AIProfileRequestResponse.fromJson(Map<String, dynamic> json) =>
      _$AIProfileRequestResponseFromJson(json);
}
