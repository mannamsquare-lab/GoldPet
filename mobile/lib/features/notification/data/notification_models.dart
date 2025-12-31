import 'package:freezed_annotation/freezed_annotation.dart';

part 'notification_models.freezed.dart';
part 'notification_models.g.dart';

@freezed
sealed class NotificationModel with _$NotificationModel {
  const factory NotificationModel({
    required int id,
    required String type, // NotificationType enum as String
    required String title,
    required String message,
    int? targetId,
    String? targetType,
    required bool isRead,
    int? senderId,
    String? senderNickname,
    String? senderProfileImage,
    DateTime? createdAt,
  }) = _NotificationModel;

  factory NotificationModel.fromJson(Map<String, dynamic> json) =>
      _$NotificationModelFromJson(json);
}

@freezed
sealed class UnreadCountResponse with _$UnreadCountResponse {
  const factory UnreadCountResponse({required int count}) =
      _UnreadCountResponse;

  factory UnreadCountResponse.fromJson(Map<String, dynamic> json) =>
      _$UnreadCountResponseFromJson(json);
}
