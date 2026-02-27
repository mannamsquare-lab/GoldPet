package com.goldpet.domain.chat.dto

import com.goldpet.domain.chat.entity.ChatMessage
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
    val readCount: Int
) {
    companion object {
        fun from(chatMessage: ChatMessage, fileAttachment: FileAttachment? = null, emoticon: Emoticon? = null): ChatMessageResponse {
            return ChatMessageResponse(
                id = chatMessage.id,
                roomId = chatMessage.chatRoom.id,
                senderId = chatMessage.sender?.id,
                senderNickname = chatMessage.sender?.nickname,
                messageType = chatMessage.messageType,
                textContent = chatMessage.textContent,
                fileId = chatMessage.fileId,
                file = fileAttachment?.let {
                    FileInfo(
                        id = it.id,
                        url = it.url,
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
                readCount = chatMessage.readCount
            )
        }
    }
}
