// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$NotificationModelImpl _$$NotificationModelImplFromJson(
  Map<String, dynamic> json,
) => _$NotificationModelImpl(
  id: (json['id'] as num).toInt(),
  type: json['type'] as String,
  title: json['title'] as String,
  message: json['message'] as String,
  targetId: (json['targetId'] as num?)?.toInt(),
  targetType: json['targetType'] as String?,
  isRead: json['isRead'] as bool,
  senderId: (json['senderId'] as num?)?.toInt(),
  senderNickname: json['senderNickname'] as String?,
  senderProfileImage: json['senderProfileImage'] as String?,
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
);

Map<String, dynamic> _$$NotificationModelImplToJson(
  _$NotificationModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'type': instance.type,
  'title': instance.title,
  'message': instance.message,
  'targetId': instance.targetId,
  'targetType': instance.targetType,
  'isRead': instance.isRead,
  'senderId': instance.senderId,
  'senderNickname': instance.senderNickname,
  'senderProfileImage': instance.senderProfileImage,
  'createdAt': instance.createdAt?.toIso8601String(),
};

_$UnreadCountResponseImpl _$$UnreadCountResponseImplFromJson(
  Map<String, dynamic> json,
) => _$UnreadCountResponseImpl(count: (json['count'] as num).toInt());

Map<String, dynamic> _$$UnreadCountResponseImplToJson(
  _$UnreadCountResponseImpl instance,
) => <String, dynamic>{'count': instance.count};
