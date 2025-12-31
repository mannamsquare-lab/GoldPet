// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'chat_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ChatRoomModelImpl _$$ChatRoomModelImplFromJson(Map<String, dynamic> json) =>
    _$ChatRoomModelImpl(
      id: (json['id'] as num).toInt(),
      roomType: json['roomType'] as String,
      title: json['title'] as String?,
      ownerUserId: (json['ownerUserId'] as num?)?.toInt(),
      matchId: (json['matchId'] as num?)?.toInt(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      participantUserIds:
          (json['participantUserIds'] as List<dynamic>?)
              ?.map((e) => (e as num).toInt())
              .toList() ??
          const [],
    );

Map<String, dynamic> _$$ChatRoomModelImplToJson(_$ChatRoomModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'roomType': instance.roomType,
      'title': instance.title,
      'ownerUserId': instance.ownerUserId,
      'matchId': instance.matchId,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'participantUserIds': instance.participantUserIds,
    };

_$ChatMessageModelImpl _$$ChatMessageModelImplFromJson(
  Map<String, dynamic> json,
) => _$ChatMessageModelImpl(
  id: (json['id'] as num).toInt(),
  roomId: (json['roomId'] as num).toInt(),
  senderId: (json['senderId'] as num?)?.toInt(),
  senderNickname: json['senderNickname'] as String?,
  messageType: json['messageType'] as String,
  textContent: json['textContent'] as String?,
  fileId: (json['fileId'] as num?)?.toInt(),
  emoticonId: (json['emoticonId'] as num?)?.toInt(),
  emojiCode: json['emojiCode'] as String?,
  createdAt: DateTime.parse(json['createdAt'] as String),
  readCount: (json['readCount'] as num?)?.toInt() ?? 0,
);

Map<String, dynamic> _$$ChatMessageModelImplToJson(
  _$ChatMessageModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'roomId': instance.roomId,
  'senderId': instance.senderId,
  'senderNickname': instance.senderNickname,
  'messageType': instance.messageType,
  'textContent': instance.textContent,
  'fileId': instance.fileId,
  'emoticonId': instance.emoticonId,
  'emojiCode': instance.emojiCode,
  'createdAt': instance.createdAt.toIso8601String(),
  'readCount': instance.readCount,
};

_$ChatMessageRequestImpl _$$ChatMessageRequestImplFromJson(
  Map<String, dynamic> json,
) => _$ChatMessageRequestImpl(
  roomId: (json['roomId'] as num).toInt(),
  senderId: (json['senderId'] as num).toInt(),
  messageType: json['messageType'] as String,
  textContent: json['textContent'] as String?,
  fileId: (json['fileId'] as num?)?.toInt(),
  emoticonId: (json['emoticonId'] as num?)?.toInt(),
  emojiCode: json['emojiCode'] as String?,
);

Map<String, dynamic> _$$ChatMessageRequestImplToJson(
  _$ChatMessageRequestImpl instance,
) => <String, dynamic>{
  'roomId': instance.roomId,
  'senderId': instance.senderId,
  'messageType': instance.messageType,
  'textContent': instance.textContent,
  'fileId': instance.fileId,
  'emoticonId': instance.emoticonId,
  'emojiCode': instance.emojiCode,
};
