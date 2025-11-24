package com.goldpet.domain.chat.dto

import com.goldpet.domain.chat.entity.ChatMessage
import com.goldpet.domain.chat.entity.MessageType
import java.time.LocalDateTime

data class ChatMessageResponse(
    val id: Long,
    val roomId: Long,
    val senderId: Long?,
    val senderNickname: String?,
    val messageType: MessageType,
    val textContent: String?,
    val fileId: Long?,
    val emoticonId: Long?,
    val emojiCode: String?,
    val createdAt: LocalDateTime,
    val readCount: Int
) {
    companion object {
        fun from(chatMessage: ChatMessage): ChatMessageResponse {
            return ChatMessageResponse(
                id = chatMessage.id,
                roomId = chatMessage.chatRoom.id,
                senderId = chatMessage.sender?.id,
                senderNickname = chatMessage.sender?.nickname,
                messageType = chatMessage.messageType,
                textContent = chatMessage.textContent,
                fileId = chatMessage.fileId,
                emoticonId = chatMessage.emoticonId,
                emojiCode = chatMessage.emojiCode,
                createdAt = chatMessage.createdAt,
                readCount = chatMessage.readCount
            )
        }
    }
}
