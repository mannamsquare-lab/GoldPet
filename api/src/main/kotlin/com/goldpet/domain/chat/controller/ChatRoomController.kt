package com.goldpet.domain.chat.controller

import com.goldpet.domain.chat.dto.ChatRoomCreateRequest
import com.goldpet.domain.chat.dto.ChatRoomResponse
import com.goldpet.domain.chat.dto.ChatMessageResponse
import com.goldpet.domain.chat.dto.ChatRequestResponse
import com.goldpet.domain.chat.dto.SendMessageRequest
import com.goldpet.domain.chat.repository.ChatMessageRepository
import com.goldpet.domain.chat.repository.ChatRoomParticipantRepository
import com.goldpet.domain.chat.service.ChatService
import com.goldpet.domain.common.repository.FileAttachmentRepository
import com.goldpet.domain.common.service.FileAttachmentLookupService
import com.goldpet.domain.emoticon.service.EmoticonService
import com.goldpet.domain.file.service.FileService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.messaging.simp.SimpMessageSendingOperations
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@Tag(name = "Chat", description = "채팅방 및 메시지 API")
@RestController
@RequestMapping("/api/v1/chat/rooms")
class ChatRoomController(
    private val chatService: ChatService,
    private val fileAttachmentRepository: FileAttachmentRepository,
    private val emoticonService: EmoticonService,
    private val simpMessageSendingOperations: SimpMessageSendingOperations,
    private val fileService: FileService,
    private val chatRoomParticipantRepository: ChatRoomParticipantRepository,
    private val chatMessageRepository: ChatMessageRepository,
    private val fileAttachmentLookupService: FileAttachmentLookupService
) {
    private fun resolveFileUrl(url: String): String =
        if (url.startsWith("http")) url else fileService.getPresignedUrl(url)

    @Operation(summary = "채팅방 생성")
    @PostMapping
    fun createChatRoom(
        @RequestBody request: ChatRoomCreateRequest,
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<ChatRoomResponse> {
        val chatRoom = chatService.createChatRoom(request, userDetails.id)
        return ResponseEntity.status(HttpStatus.CREATED).body(ChatRoomResponse.from(chatRoom))
    }

    @Operation(summary = "채팅방 목록 조회")
    @GetMapping
    fun getChatRooms(
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<List<ChatRoomResponse>> {
        val chatRooms = chatService.getUserChatRooms(userDetails.id)
        return ResponseEntity.ok(chatRooms.map { ChatRoomResponse.from(it, userDetails.id) })
    }

    @Operation(summary = "내 채팅방 목록 조회")
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
        return ResponseEntity.ok(chatRooms.map { ChatRoomResponse.from(it, userId) })
    }

    @Operation(summary = "채팅 메시지 목록 조회")
    @GetMapping("/{roomId}/messages")
    fun getChatMessages(
        @PathVariable roomId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int
    ): ResponseEntity<List<ChatMessageResponse>> {
        val messages = chatService.getChatHistory(roomId, page, size)
        val participants = chatRoomParticipantRepository.findAllByChatRoomId(roomId)

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

        // T1-1.4 batch prefetch: emoticon image URL → FileAttachment variant lookup warm.
        // T1-9 에서 seed emoticon 도 S3 FileAttachment 경유로 전환됐으므로 이 lookup 이 hit.
        val emoticonUrls = (emoticons.values.map { it.imageUrl } + replyToEmoticons.values.map { it.imageUrl }).distinct()
        if (emoticonUrls.isNotEmpty()) fileAttachmentLookupService.batchLookup(emoticonUrls)

        return ResponseEntity.ok(messages.map { msg ->
            val resolvedUrl = msg.fileId?.let { fileAttachments[it] }?.url?.let { resolveFileUrl(it) }
            val resolvedReplyUrl = msg.replyTo?.fileId?.let { replyToFileAttachments[it] }?.url?.let { resolveFileUrl(it) }
            ChatMessageResponse.from(
                msg,
                participants,
                msg.fileId?.let { fileAttachments[it] },
                msg.emoticonId?.let { emoticons[it] },
                msg.replyTo?.fileId?.let { replyToFileAttachments[it] },
                msg.replyTo?.emoticonId?.let { replyToEmoticons[it] },
                resolvedFileUrl = resolvedUrl,
                resolvedReplyToFileUrl = resolvedReplyUrl,
                variantResolver = fileAttachmentLookupService
            )
        })
    }

    @Operation(summary = "메시지 전송")
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

        val resolvedUrl = fileAttachment?.url?.let { resolveFileUrl(it) }
        val resolvedReplyUrl = replyToFileAttachment?.url?.let { resolveFileUrl(it) }
        val allParticipants = chatRoomParticipantRepository.findAllByChatRoomId(roomId)
        val chatMessageResponse = ChatMessageResponse.from(
            message, allParticipants, fileAttachment, emoticon, replyToFileAttachment, replyToEmoticon,
            resolvedFileUrl = resolvedUrl,
            resolvedReplyToFileUrl = resolvedReplyUrl,
            variantResolver = fileAttachmentLookupService
        )

        // Broadcast to WebSocket subscribers for real-time updates (chat detail page)
        simpMessageSendingOperations.convertAndSend("/topic/chat/$roomId", chatMessageResponse)

        // Broadcast to user-specific topics for chat list updates
        allParticipants.forEach { participant ->
            simpMessageSendingOperations.convertAndSend(
                "/topic/user/${participant.user.id}/chats",
                mapOf("roomId" to roomId, "type" to "NEW_MESSAGE")
            )
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(chatMessageResponse)
    }

    @Operation(summary = "메시지 삭제")
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

    @Operation(summary = "메시지 읽음 처리")
    @PostMapping("/{roomId}/read")
    fun markAsRead(
        @PathVariable roomId: Long,
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<Void> {
        val oldLastReadAt = chatService.markAsRead(roomId, userDetails.id)

        // Fetch messages that were newly read (between old and new lastReadAt)
        val newlyReadMessages = if (oldLastReadAt != null) {
            chatMessageRepository.findByChatRoomIdAndCreatedAtAfter(roomId, oldLastReadAt)
        } else {
            // First time reading: all messages in the room
            chatMessageRepository.findAllByChatRoomId(roomId)
        }

        if (newlyReadMessages.isEmpty()) {
            return ResponseEntity.ok().build()
        }

        // Fetch updated participants (with new lastReadAt already persisted)
        val participants = chatRoomParticipantRepository.findAllByChatRoomId(roomId)

        // Compute per-message unreadCount using existing logic
        val updates = newlyReadMessages.map { msg ->
            mapOf(
                "messageId" to msg.id,
                "unreadCount" to ChatMessageResponse.computeUnreadCount(msg, participants)
            )
        }

        // Broadcast enriched read event
        simpMessageSendingOperations.convertAndSend(
            "/topic/chat/$roomId/read",
            mapOf(
                "type" to "READ_UPDATE",
                "userId" to userDetails.id,
                "updates" to updates
            )
        )

        return ResponseEntity.ok().build()
    }

    @Operation(summary = "채팅방 초대")
    @PostMapping("/{roomId}/invite")
    fun inviteToRoom(
        @PathVariable roomId: Long,
        @RequestBody body: Map<String, Long>,
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<Map<String, String>> {
        val userId = body["userId"] ?: throw IllegalArgumentException("userId is required")
        val chatRoom = chatService.inviteParticipant(roomId, userDetails.id, userId)

        // Broadcast system message if room was converted to GROUP
        val lastMessage = chatRoom.messages.lastOrNull()
        if (lastMessage != null && lastMessage.messageType == com.goldpet.domain.chat.entity.MessageType.SYSTEM) {
            simpMessageSendingOperations.convertAndSend(
                "/topic/chat/$roomId",
                ChatMessageResponse.from(lastMessage)
            )
        }

        return ResponseEntity.ok(mapOf("roomType" to chatRoom.roomType.name))
    }

    @Operation(summary = "채팅방 나가기")
    @DeleteMapping("/{roomId}/leave")
    fun leaveRoom(
        @PathVariable roomId: Long,
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<Void> {
        chatService.leaveRoom(roomId, userDetails.id)
        return ResponseEntity.ok().build()
    }

    @Operation(summary = "1:1 채팅방 조회 또는 생성")
    @PostMapping("/direct/{targetUserId}")
    fun getOrCreateDirectRoom(
        @PathVariable targetUserId: Long,
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<ChatRoomResponse> {
        val chatRoom = chatService.getOrCreateDirectRoom(userDetails.id, targetUserId)
        return ResponseEntity.ok(ChatRoomResponse.from(chatRoom, userDetails.id))
    }

    @Operation(summary = "채팅 요청 목록 조회")
    @GetMapping("/requests")
    fun getChatRequests(
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<List<ChatRequestResponse>> {
        val requests = chatService.getPendingRequests(userDetails.id)
        return ResponseEntity.ok(requests.map { ChatRequestResponse.from(it) })
    }

    @Operation(summary = "채팅 요청 수락")
    @PostMapping("/requests/{requestId}/accept")
    fun acceptChatRequest(
        @PathVariable requestId: Long,
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<ChatRoomResponse> {
        val chatRoom = chatService.acceptRequest(requestId, userDetails.id)
        return ResponseEntity.ok(ChatRoomResponse.from(chatRoom, userDetails.id))
    }

    @Operation(summary = "채팅 요청 거절")
    @PostMapping("/requests/{requestId}/reject")
    fun rejectChatRequest(
        @PathVariable requestId: Long,
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<Void> {
        chatService.rejectRequest(requestId, userDetails.id)
        return ResponseEntity.ok().build()
    }

    @Operation(summary = "채팅 요청 삭제")
    @DeleteMapping("/requests/{requestId}")
    fun deleteChatRequest(
        @PathVariable requestId: Long,
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<Void> {
        chatService.deleteRequest(requestId, userDetails.id)
        return ResponseEntity.ok().build()
    }
}
