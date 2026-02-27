package com.goldpet.domain.chat.controller

import com.goldpet.domain.chat.dto.ChatMessageRequest
import com.goldpet.domain.chat.dto.ChatMessageResponse
import com.goldpet.domain.chat.service.ChatService
import com.goldpet.domain.emoticon.service.EmoticonService
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.messaging.simp.SimpMessageSendingOperations
import org.springframework.stereotype.Controller

data class TypingEvent(
    val roomId: Long,
    val userId: Long,
    val isTyping: Boolean
)

@Controller
class WebSocketChatController(
    private val simpMessageSendingOperations: SimpMessageSendingOperations,
    private val chatService: ChatService,
    private val emoticonService: EmoticonService
) {

    @MessageMapping("/chat.sendMessage")
    fun sendMessage(@Payload chatMessageRequest: ChatMessageRequest) {
        val savedMessage = chatService.saveChatMessage(chatMessageRequest)
        val emoticon = savedMessage.emoticonId?.let { emoticonService.getById(it) }
        val chatMessageResponse = ChatMessageResponse.from(savedMessage, emoticon = emoticon)
        simpMessageSendingOperations.convertAndSend("/topic/chat/${chatMessageRequest.roomId}", chatMessageResponse)
    }

    @MessageMapping("/chat.typing")
    fun typing(@Payload typingEvent: TypingEvent) {
        // Broadcast typing status to all subscribers of the room
        simpMessageSendingOperations.convertAndSend(
            "/topic/chat/${typingEvent.roomId}/typing",
            typingEvent
        )
    }
}
