package com.goldpet.domain.chat.controller

import com.goldpet.domain.chat.dto.ChatRoomCreateRequest
import com.goldpet.domain.chat.dto.ChatRoomResponse
import com.goldpet.domain.chat.dto.ChatMessageResponse
import com.goldpet.domain.chat.dto.ChatRequestResponse
import com.goldpet.domain.chat.dto.SendMessageRequest
import com.goldpet.domain.chat.service.ChatService
import com.goldpet.domain.common.repository.FileAttachmentRepository
import com.goldpet.domain.emoticon.service.EmoticonService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.messaging.simp.SimpMessageSendingOperations
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/chat/rooms")
class ChatRoomController(
    private val chatService: ChatService,
    private val fileAttachmentRepository: FileAttachmentRepository,
    private val emoticonService: EmoticonService,
    private val simpMessageSendingOperations: SimpMessageSendingOperations
) {
    @PostMapping
    fun createChatRoom(
        @RequestBody request: ChatRoomCreateRequest,
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<ChatRoomResponse> {
        val chatRoom = chatService.createChatRoom(request, userDetails.id)
        return ResponseEntity.status(HttpStatus.CREATED).body(ChatRoomResponse.from(chatRoom))
    }

    @GetMapping
    fun getChatRooms(
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<List<ChatRoomResponse>> {
        val chatRooms = chatService.getUserChatRooms(userDetails.id)
        return ResponseEntity.ok(chatRooms.map { ChatRoomResponse.from(it, userDetails.id) })
    }

    @GetMapping("/my")
    fun getMyChatRooms(
        @AuthenticationPrincipal principal: org.springframework.security.core.userdetails.UserDetails
    ): ResponseEntity<List<ChatRoomResponse>> {
        val userId = if (principal is com.goldpet.config.security.UserPrincipal) {
            principal.id
        } else {
            // Fallback for other principal types if necessary
            // For now, assuming username lookup or throwing helpful error
             throw IllegalStateException("Unexpected principal type: ${principal::class.java}")
        }
        val chatRooms = chatService.getUserChatRooms(userId)
        return ResponseEntity.ok(chatRooms.map { ChatRoomResponse.from(it) })
    }

    @GetMapping("/{roomId}/messages")
    fun getChatMessages(
        @PathVariable roomId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int
    ): ResponseEntity<List<ChatMessageResponse>> {
        val messages = chatService.getChatHistory(roomId, page, size)

        // Fetch all file attachments for messages with fileId
        val fileIds = messages.mapNotNull { it.fileId }
        val fileAttachments = if (fileIds.isNotEmpty()) {
            fileAttachmentRepository.findAllById(fileIds).associateBy { it.id }
        } else {
            emptyMap()
        }

        // Batch-fetch emoticons for messages with emoticonId
        val emoticonIds = messages.mapNotNull { it.emoticonId }
        val emoticons = emoticonService.getByIds(emoticonIds)

        // Batch-fetch replyTo file attachments and emoticons for reply previews
        val replyToFileIds = messages.mapNotNull { it.replyTo?.fileId }
        val replyToFileAttachments = if (replyToFileIds.isNotEmpty()) {
            fileAttachmentRepository.findAllById(replyToFileIds).associateBy { it.id }
        } else {
            emptyMap()
        }
        val replyToEmoticonIds = messages.mapNotNull { it.replyTo?.emoticonId }
        val replyToEmoticons = if (replyToEmoticonIds.isNotEmpty()) {
            emoticonService.getByIds(replyToEmoticonIds)
        } else {
            emptyMap()
        }

        return ResponseEntity.ok(messages.map { msg ->
            ChatMessageResponse.from(
                msg,
                msg.fileId?.let { fileAttachments[it] },
                msg.emoticonId?.let { emoticons[it] },
                msg.replyTo?.fileId?.let { replyToFileAttachments[it] },
                msg.replyTo?.emoticonId?.let { replyToEmoticons[it] }
            )
        })
    }

    @PostMapping("/{roomId}/messages")
    fun sendMessage(
        @PathVariable roomId: Long,
        @Valid @RequestBody request: SendMessageRequest,
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<ChatMessageResponse> {
        val messageRequest = com.goldpet.domain.chat.dto.ChatMessageRequest(
            roomId = roomId,
            senderId = userDetails.id,
            messageType = request.messageType,
            textContent = request.content,
            fileId = request.fileId,
            emoticonId = request.emoticonId,
            replyToId = request.replyToId
        )
        val message = chatService.saveChatMessage(messageRequest)

        // Fetch file attachment if present
        val fileAttachment = request.fileId?.let { fileAttachmentRepository.findById(it).orElse(null) }

        // Fetch emoticon if present
        val emoticon = request.emoticonId?.let { emoticonService.getById(it) }

        // Fetch replyTo's file/emoticon for reply preview
        val replyToFileAttachment = message.replyTo?.fileId?.let { fileAttachmentRepository.findById(it).orElse(null) }
        val replyToEmoticon = message.replyTo?.emoticonId?.let { emoticonService.getById(it) }

        val chatMessageResponse = ChatMessageResponse.from(message, fileAttachment, emoticon, replyToFileAttachment, replyToEmoticon)

        // Broadcast to WebSocket subscribers for real-time updates (chat detail page)
        simpMessageSendingOperations.convertAndSend("/topic/chat/$roomId", chatMessageResponse)

        // Broadcast to user-specific topics for chat list updates
        val participants = chatService.getParticipants(roomId)
        participants.forEach { participant ->
            simpMessageSendingOperations.convertAndSend(
                "/topic/user/${participant.user.id}/chats",
                mapOf("roomId" to roomId, "type" to "NEW_MESSAGE")
            )
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(chatMessageResponse)
    }

    @DeleteMapping("/{roomId}/messages/{messageId}")
    fun deleteMessage(
        @PathVariable roomId: Long,
        @PathVariable messageId: Long,
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<Void> {
        chatService.deleteMessage(roomId, messageId, userDetails.id)
        simpMessageSendingOperations.convertAndSend(
            "/topic/chat/$roomId",
            mapOf("type" to "MESSAGE_DELETED", "messageId" to messageId)
        )
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{roomId}/read")
    fun markAsRead(
        @PathVariable roomId: Long,
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<Void> {
        chatService.markAsRead(roomId, userDetails.id)
        return ResponseEntity.ok().build()
    }

    @PostMapping("/{roomId}/invite")
    fun inviteToRoom(
        @PathVariable roomId: Long,
        @RequestBody body: Map<String, Long>,
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<Void> {
        val userId = body["userId"] ?: throw IllegalArgumentException("userId is required")
        chatService.inviteParticipant(roomId, userDetails.id, userId)
        return ResponseEntity.ok().build()
    }

    @DeleteMapping("/{roomId}/leave")
    fun leaveRoom(
        @PathVariable roomId: Long,
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<Void> {
        chatService.leaveRoom(roomId, userDetails.id)
        return ResponseEntity.ok().build()
    }

    /**
     * Get or create a direct chat room with a matched user.
     * If chat room exists, returns it. Otherwise, creates a new one.
     */
    @PostMapping("/direct/{targetUserId}")
    fun getOrCreateDirectRoom(
        @PathVariable targetUserId: Long,
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<ChatRoomResponse> {
        val chatRoom = chatService.getOrCreateDirectRoom(userDetails.id, targetUserId)
        return ResponseEntity.ok(ChatRoomResponse.from(chatRoom, userDetails.id))
    }

    @GetMapping("/requests")
    fun getChatRequests(
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<List<ChatRequestResponse>> {
        val requests = chatService.getPendingRequests(userDetails.id)
        return ResponseEntity.ok(requests.map { ChatRequestResponse.from(it) })
    }

    @PostMapping("/requests/{requestId}/accept")
    fun acceptChatRequest(
        @PathVariable requestId: Long,
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<ChatRoomResponse> {
        val chatRoom = chatService.acceptRequest(requestId, userDetails.id)
        return ResponseEntity.ok(ChatRoomResponse.from(chatRoom, userDetails.id))
    }

    @PostMapping("/requests/{requestId}/reject")
    fun rejectChatRequest(
        @PathVariable requestId: Long,
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<Void> {
        chatService.rejectRequest(requestId, userDetails.id)
        return ResponseEntity.ok().build()
    }

    @DeleteMapping("/requests/{requestId}")
    fun deleteChatRequest(
        @PathVariable requestId: Long,
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<Void> {
        chatService.deleteRequest(requestId, userDetails.id)
        return ResponseEntity.ok().build()
    }
}
