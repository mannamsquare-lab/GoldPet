// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'ai_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$AIStyleOptionImpl _$$AIStyleOptionImplFromJson(Map<String, dynamic> json) =>
    _$AIStyleOptionImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      previewUrl: json['previewUrl'] as String,
      goldCost: (json['goldCost'] as num).toInt(),
    );

Map<String, dynamic> _$$AIStyleOptionImplToJson(_$AIStyleOptionImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'previewUrl': instance.previewUrl,
      'goldCost': instance.goldCost,
    };

_$CreateAIProfileRequestImpl _$$CreateAIProfileRequestImplFromJson(
  Map<String, dynamic> json,
) => _$CreateAIProfileRequestImpl(
  petId: (json['petId'] as num).toInt(),
  type: $enumDecode(_$AIRequestTypeEnumMap, json['type']),
  sourceImageUrl: json['sourceImageUrl'] as String,
  stylePrompt: json['stylePrompt'] as String?,
);

Map<String, dynamic> _$$CreateAIProfileRequestImplToJson(
  _$CreateAIProfileRequestImpl instance,
) => <String, dynamic>{
  'petId': instance.petId,
  'type': _$AIRequestTypeEnumMap[instance.type]!,
  'sourceImageUrl': instance.sourceImageUrl,
  'stylePrompt': instance.stylePrompt,
};

const _$AIRequestTypeEnumMap = {
  AIRequestType.IMAGE: 'IMAGE',
  AIRequestType.VIDEO: 'VIDEO',
};

_$AIProfileRequestResponseImpl _$$AIProfileRequestResponseImplFromJson(
  Map<String, dynamic> json,
) => _$AIProfileRequestResponseImpl(
  id: (json['id'] as num).toInt(),
  petId: (json['petId'] as num).toInt(),
  petName: json['petName'] as String,
  type: $enumDecode(_$AIRequestTypeEnumMap, json['type']),
  sourceImageUrl: json['sourceImageUrl'] as String,
  stylePrompt: json['stylePrompt'] as String?,
  status: $enumDecode(_$AIRequestStatusEnumMap, json['status']),
  resultUrl: json['resultUrl'] as String?,
  errorMessage: json['errorMessage'] as String?,
  goldCost: (json['goldCost'] as num).toInt(),
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
);

Map<String, dynamic> _$$AIProfileRequestResponseImplToJson(
  _$AIProfileRequestResponseImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'petId': instance.petId,
  'petName': instance.petName,
  'type': _$AIRequestTypeEnumMap[instance.type]!,
  'sourceImageUrl': instance.sourceImageUrl,
  'stylePrompt': instance.stylePrompt,
  'status': _$AIRequestStatusEnumMap[instance.status]!,
  'resultUrl': instance.resultUrl,
  'errorMessage': instance.errorMessage,
  'goldCost': instance.goldCost,
  'createdAt': instance.createdAt?.toIso8601String(),
};

const _$AIRequestStatusEnumMap = {
  AIRequestStatus.REQUESTED: 'REQUESTED',
  AIRequestStatus.PROCESSING: 'PROCESSING',
  AIRequestStatus.COMPLETED: 'COMPLETED',
  AIRequestStatus.FAILED: 'FAILED',
  AIRequestStatus.CANCELLED: 'CANCELLED',
};
