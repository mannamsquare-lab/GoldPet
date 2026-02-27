package com.goldpet.domain.chat.dto

import com.goldpet.domain.chat.entity.MessageType
import jakarta.validation.constraints.Size

data class SendMessageRequest(
    @field:Size(max = 5000, message = "메시지는 5000자를 초과할 수 없습니다")
    val content: String? = null,
    val messageType: MessageType = MessageType.TEXT,
    val fileId: Long? = null,
    val emoticonId: Long? = null
)
