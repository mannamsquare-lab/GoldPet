package com.goldpet.domain.chat.dto

import com.goldpet.domain.chat.entity.MessageType

data class ChatMessageRequest(
    val roomId: Long,
    val senderId: Long,
    val messageType: MessageType,
    val textContent: String? = null,
    val fileId: Long? = null,
    val emoticonId: Long? = null,
    val emojiCode: String? = null
)
