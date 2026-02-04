package com.goldpet.domain.chat.dto

import com.goldpet.domain.chat.entity.MessageType

data class SendMessageRequest(
    val content: String? = null,
    val messageType: MessageType = MessageType.TEXT,
    val fileId: Long? = null
)
