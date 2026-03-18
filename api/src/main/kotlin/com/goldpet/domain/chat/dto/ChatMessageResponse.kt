package com.goldpet.domain.chat.dto

import com.goldpet.domain.chat.entity.ChatMessage
import com.goldpet.domain.chat.entity.ChatRoomParticipant
import com.goldpet.domain.chat.entity.MessageType
import com.goldpet.domain.common.entity.FileAttachment
import com.goldpet.domain.emoticon.entity.Emoticon
import java.time.LocalDateTime

data class FileInfo(
    val id: Long,
    val url: String,
    val fileType: String,
    val mimeType: String,
    val originalFileName: String?,
    val sizeBytes: Long?,
    val width: Int?,
    val height: Int?
)

data class ChatMessageResponse(
    val id: Long,
    val roomId: Long,
    val senderId: Long?,
    val senderNickname: String?,
    val messageType: MessageType,
    val textContent: String?,
    val fileId: Long?,
    val file: FileInfo?,
    val emoticonId: Long?,
    val emoticonImageUrl: String?,
    val emoticonName: String?,
    val emojiCode: String?,
    val createdAt: LocalDateTime,
    val unreadCount: Int,
    val replyToId: Long? = null,
    val replyToSenderNickname: String? = null,
    val replyToTextContent: String? = null,
    val replyToMessageType: MessageType? = null,
    val replyToFileUrl: String? = null,
    val replyToFileName: String? = null,
    val replyToEmoticonImageUrl: String? = null,
    val deletedAt: LocalDateTime? = null
) {
    companion object {
        fun from(
            chatMessage: ChatMessage,
            fileAttachment: FileAttachment? = null,
            emoticon: Emoticon? = null,
            replyToFileAttachment: FileAttachment? = null,
            replyToEmoticon: Emoticon? = null,
            resolvedFileUrl: String? = null,
            resolvedReplyToFileUrl: String? = null
        ): ChatMessageResponse {
            val isDeleted = chatMessage.deletedAt != null
            return ChatMessageResponse(
                id = chatMessage.id,
                roomId = chatMessage.chatRoom.id,
                senderId = chatMessage.sender?.id,
                senderNickname = chatMessage.sender?.nickname,
                messageType = chatMessage.messageType,
                textContent = if (isDeleted) null else chatMessage.textContent,
                fileId = chatMessage.fileId,
                file = fileAttachment?.let {
                    FileInfo(
                        id = it.id,
                        url = resolvedFileUrl ?: it.url,
                        fileType = it.fileType,
                        mimeType = it.mimeType,
                        originalFileName = it.originalFileName,
                        sizeBytes = it.sizeBytes,
                        width = it.width,
                        height = it.height
                    )
                },
                emoticonId = chatMessage.emoticonId,
                emoticonImageUrl = emoticon?.imageUrl,
                emoticonName = emoticon?.name,
                emojiCode = chatMessage.emojiCode,
                createdAt = chatMessage.createdAt,
                unreadCount = 0,
                replyToId = chatMessage.replyTo?.id,
                replyToSenderNickname = chatMessage.replyTo?.sender?.nickname,
                replyToTextContent = chatMessage.replyTo?.textContent,
                replyToMessageType = chatMessage.replyTo?.messageType,
                replyToFileUrl = resolvedReplyToFileUrl ?: replyToFileAttachment?.url,
                replyToFileName = replyToFileAttachment?.originalFileName,
                replyToEmoticonImageUrl = replyToEmoticon?.imageUrl,
                deletedAt = chatMessage.deletedAt
            )
        }

        fun from(
            chatMessage: ChatMessage,
            participants: List<ChatRoomParticipant>,
            fileAttachment: FileAttachment? = null,
            emoticon: Emoticon? = null,
            replyToFileAttachment: FileAttachment? = null,
            replyToEmoticon: Emoticon? = null,
            resolvedFileUrl: String? = null,
            resolvedReplyToFileUrl: String? = null
        ): ChatMessageResponse {
            val computedUnreadCount = computeUnreadCount(chatMessage, participants)
            val isDeleted = chatMessage.deletedAt != null
            return ChatMessageResponse(
                id = chatMessage.id,
                roomId = chatMessage.chatRoom.id,
                senderId = chatMessage.sender?.id,
                senderNickname = chatMessage.sender?.nickname,
                messageType = chatMessage.messageType,
                textContent = if (isDeleted) null else chatMessage.textContent,
                fileId = chatMessage.fileId,
                file = fileAttachment?.let {
                    FileInfo(
                        id = it.id,
                        url = resolvedFileUrl ?: it.url,
                        fileType = it.fileType,
                        mimeType = it.mimeType,
                        originalFileName = it.originalFileName,
                        sizeBytes = it.sizeBytes,
                        width = it.width,
                        height = it.height
                    )
                },
                emoticonId = chatMessage.emoticonId,
                emoticonImageUrl = emoticon?.imageUrl,
                emoticonName = emoticon?.name,
                emojiCode = chatMessage.emojiCode,
                createdAt = chatMessage.createdAt,
                unreadCount = computedUnreadCount,
                replyToId = chatMessage.replyTo?.id,
                replyToSenderNickname = chatMessage.replyTo?.sender?.nickname,
                replyToTextContent = chatMessage.replyTo?.textContent,
                replyToMessageType = chatMessage.replyTo?.messageType,
                replyToFileUrl = resolvedReplyToFileUrl ?: replyToFileAttachment?.url,
                replyToFileName = replyToFileAttachment?.originalFileName,
                replyToEmoticonImageUrl = replyToEmoticon?.imageUrl,
                deletedAt = chatMessage.deletedAt
            )
        }

        private fun computeUnreadCount(message: ChatMessage, participants: List<ChatRoomParticipant>): Int {
            val sender = message.sender ?: return 0
            return participants.count { p ->
                p.user.id != sender.id &&
                if (p.leftAt == null) {
                    p.lastReadAt == null || p.lastReadAt!! < message.createdAt
                } else {
                    message.createdAt <= p.leftAt!! &&
                    (p.lastReadAt == null || p.lastReadAt!! < message.createdAt)
                }
            }
        }
    }
}
