package com.goldpet.domain.chat.controller

import com.goldpet.domain.chat.dto.ChatMessageRequest
import com.goldpet.domain.chat.dto.ChatMessageResponse
import com.goldpet.domain.chat.service.ChatService
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.messaging.simp.SimpMessageSendingOperations
import org.springframework.stereotype.Controller

@Controller
class WebSocketChatController(
    private val simpMessageSendingOperations: SimpMessageSendingOperations,
    private val chatService: ChatService
) {

    @MessageMapping("/chat.sendMessage")
    fun sendMessage(@Payload chatMessageRequest: ChatMessageRequest) {
        val savedMessage = chatService.saveChatMessage(chatMessageRequest)
        val chatMessageResponse = ChatMessageResponse.from(savedMessage)
        simpMessageSendingOperations.convertAndSend("/topic/chat/${chatMessageRequest.roomId}", chatMessageResponse)
    }

    // You can add more message mappings here, e.g., for adding/removing users from a chat room
    // or for typing indicators.
}
