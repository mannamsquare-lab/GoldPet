package com.goldpet.domain.chat.controller

import com.goldpet.domain.chat.dto.ChatMessageRequest
import com.goldpet.domain.chat.dto.ChatMessageResponse
import com.goldpet.domain.chat.repository.ChatRoomParticipantRepository
import com.goldpet.domain.chat.service.ChatService
import com.goldpet.domain.common.repository.FileAttachmentRepository
import com.goldpet.domain.common.service.FileAttachmentLookupService
import com.goldpet.domain.emoticon.service.EmoticonService
import com.goldpet.config.openapi.OpenApiInternal
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.messaging.simp.SimpMessageSendingOperations
import org.springframework.stereotype.Controller

data class TypingEvent(
    val roomId: Long,
    val userId: Long,
    val isTyping: Boolean
)

@OpenApiInternal
@Controller
class WebSocketChatController(
    private val simpMessageSendingOperations: SimpMessageSendingOperations,
    private val chatService: ChatService,
    private val emoticonService: EmoticonService,
    private val fileAttachmentRepository: FileAttachmentRepository,
    private val chatRoomParticipantRepository: ChatRoomParticipantRepository,
    private val fileAttachmentLookupService: FileAttachmentLookupService
) {

    @MessageMapping("/chat.sendMessage")
    fun sendMessage(@Payload chatMessageRequest: ChatMessageRequest) {
        val savedMessage = chatService.saveChatMessage(chatMessageRequest)
        val emoticon = savedMessage.emoticonId?.let { emoticonService.getById(it) }
        val replyToFileAttachment = savedMessage.replyTo?.fileId?.let { fileAttachmentRepository.findById(it).orElse(null) }
        val replyToEmoticon = savedMessage.replyTo?.emoticonId?.let { emoticonService.getById(it) }
        val allParticipants = chatRoomParticipantRepository.findAllByChatRoomId(chatMessageRequest.roomId)
        val chatMessageResponse = ChatMessageResponse.from(savedMessage, allParticipants, emoticon = emoticon, replyToFileAttachment = replyToFileAttachment, replyToEmoticon = replyToEmoticon, variantResolver = fileAttachmentLookupService)
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
