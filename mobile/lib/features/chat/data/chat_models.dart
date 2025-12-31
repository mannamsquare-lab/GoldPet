import 'package:freezed_annotation/freezed_annotation.dart';

part 'chat_models.freezed.dart';
part 'chat_models.g.dart';

@freezed
sealed class ChatRoomModel with _$ChatRoomModel {
  const factory ChatRoomModel({
    required int id,
    required String roomType,
    String? title,
    int? ownerUserId,
    int? matchId,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default([]) List<int> participantUserIds,
  }) = _ChatRoomModel;

  factory ChatRoomModel.fromJson(Map<String, dynamic> json) =>
      _$ChatRoomModelFromJson(json);
}

@freezed
sealed class ChatMessageModel with _$ChatMessageModel {
  const factory ChatMessageModel({
    required int id,
    required int roomId,
    int? senderId,
    String? senderNickname,
    required String messageType,
    String? textContent,
    int? fileId,
    int? emoticonId,
    String? emojiCode,
    required DateTime createdAt,
    @Default(0) int readCount,
  }) = _ChatMessageModel;

  factory ChatMessageModel.fromJson(Map<String, dynamic> json) =>
      _$ChatMessageModelFromJson(json);
}

@freezed
sealed class ChatMessageRequest with _$ChatMessageRequest {
  const factory ChatMessageRequest({
    required int roomId,
    required int senderId,
    required String messageType,
    String? textContent,
    int? fileId,
    int? emoticonId,
    String? emojiCode,
  }) = _ChatMessageRequest;

  factory ChatMessageRequest.fromJson(Map<String, dynamic> json) =>
      _$ChatMessageRequestFromJson(json);
}
