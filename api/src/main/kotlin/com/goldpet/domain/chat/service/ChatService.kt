package com.goldpet.domain.chat.service

import com.goldpet.domain.chat.dto.ChatRoomCreateRequest
import com.goldpet.domain.chat.dto.ChatMessageRequest
import com.goldpet.domain.chat.entity.*
import com.goldpet.domain.chat.repository.ChatMessageRepository
import com.goldpet.domain.chat.repository.ChatRequestRepository
import com.goldpet.domain.chat.repository.ChatRoomParticipantRepository
import com.goldpet.domain.chat.repository.ChatRoomRepository
import com.goldpet.domain.common.exception.*
import com.goldpet.domain.friend.repository.MatchRepository
import com.goldpet.domain.friend.repository.UserBlockRepository
import com.goldpet.domain.notification.service.NotificationService
import com.goldpet.domain.user.repository.UserRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class ChatService(
    private val chatRoomRepository: ChatRoomRepository,
    private val chatRoomParticipantRepository: ChatRoomParticipantRepository,
    private val chatMessageRepository: ChatMessageRepository,
    private val userRepository: UserRepository,
    private val matchRepository: MatchRepository,
    private val notificationService: NotificationService,
    private val userBlockRepository: UserBlockRepository,
    private val chatRequestRepository: ChatRequestRepository
) {

    @Transactional
    fun createChatRoom(request: ChatRoomCreateRequest, creatorId: Long): ChatRoom {
        val creator = userRepository.findById(creatorId).orElseThrow { NotFoundException("User not found with id: $creatorId") }

        // Handle DIRECT chat room creation
        if (request.roomType == ChatRoomType.DIRECT) {
            val targetUserId = request.participantUserIds.firstOrNull()
                ?: throw BadRequestException("Direct chat room requires a target user ID.")
            val targetUser = userRepository.findById(targetUserId).orElseThrow { NotFoundException("Target user not found with id: $targetUserId") }

            // Find existing match
            val match = request.matchId?.let { matchRepository.findById(it).orElse(null) }
                ?: throw BadRequestException("Direct chat room requires a valid match ID.")

            // Check if a direct chat room for this match already exists
            chatRoomRepository.findByMatchId(match.id).ifPresent {
                throw IllegalStateException("Direct chat room for match ${match.id} already exists.")
            }

            val chatRoom = ChatRoom(
                roomType = ChatRoomType.DIRECT,
                ownerUser = creator, // Owner can be the creator for direct chat
                match = match
            )
            chatRoomRepository.save(chatRoom)

            // Add participants
            chatRoomParticipantRepository.save(ChatRoomParticipant(chatRoom = chatRoom, user = creator, role = ChatRoomRole.MEMBER))
            chatRoomParticipantRepository.save(ChatRoomParticipant(chatRoom = chatRoom, user = targetUser, role = ChatRoomRole.MEMBER))

            return chatRoom
        } else {
            // Handle GROUP or AI_PET chat room creation
            val chatRoom = ChatRoom(
                roomType = request.roomType,
                title = request.title,
                ownerUser = creator
            )
            chatRoomRepository.save(chatRoom)

            // Add creator as owner/member
            chatRoomParticipantRepository.save(ChatRoomParticipant(chatRoom = chatRoom, user = creator, role = ChatRoomRole.OWNER))

            // Add other participants for GROUP chat
            if (request.roomType == ChatRoomType.GROUP) {
                request.participantUserIds.forEach { userId ->
                    val user = userRepository.findById(userId).orElseThrow { NotFoundException("Participant user not found with id: $userId") }
                    chatRoomParticipantRepository.save(ChatRoomParticipant(chatRoom = chatRoom, user = user, role = ChatRoomRole.MEMBER))
                }
            }
            return chatRoom
        }
    }

    @Transactional
    fun addParticipant(roomId: Long, userId: Long, role: ChatRoomRole = ChatRoomRole.MEMBER): ChatRoomParticipant {
        val chatRoom = chatRoomRepository.findById(roomId).orElseThrow { NotFoundException("Chat room not found with id: $roomId") }
        val user = userRepository.findById(userId).orElseThrow { NotFoundException("User not found with id: $userId") }

        if (chatRoomParticipantRepository.findByChatRoomIdAndUserId(roomId, userId).isPresent) {
            throw IllegalStateException("User ${user.nickname} is already a participant in chat room ${chatRoom.title}.")
        }

        val participant = ChatRoomParticipant(chatRoom = chatRoom, user = user, role = role)
        return chatRoomParticipantRepository.save(participant)
    }

    @Transactional
    fun inviteParticipant(roomId: Long, requesterId: Long, inviteeId: Long) {
        // Verify requester is an active participant
        chatRoomParticipantRepository.findByChatRoomIdAndUserId(roomId, requesterId)
            .orElseThrow { ForbiddenException("User $requesterId is not a participant of chat room $roomId") }
        addParticipant(roomId, inviteeId)
    }

    @Transactional
    fun removeParticipant(roomId: Long, userId: Long) {
        val participant = chatRoomParticipantRepository.findByChatRoomIdAndUserId(roomId, userId)
            .orElseThrow { NotFoundException("Participant not found in chat room $roomId for user $userId") }
        chatRoomParticipantRepository.delete(participant)
    }

    @Transactional
    fun saveChatMessage(request: ChatMessageRequest): ChatMessage {
        val chatRoom = chatRoomRepository.findById(request.roomId).orElseThrow { NotFoundException("Chat room not found with id: ${request.roomId}") }
        val sender = userRepository.findById(request.senderId).orElseThrow { NotFoundException("Sender user not found with id: ${request.senderId}") }

        // Validate sender is a participant if not a system message
        if (request.messageType != MessageType.SYSTEM) {
            chatRoomParticipantRepository.findByChatRoomIdAndUserId(chatRoom.id, sender.id)
                .orElseThrow { IllegalStateException("Sender is not a participant of this chat room.") }
        }

        // Block check: verify no block relationship with the other participant in 1:1 chat
        val otherParticipant = chatRoom.participants.firstOrNull { it.user.id != request.senderId }
        if (otherParticipant != null) {
            val otherId = otherParticipant.user.id
            if (userBlockRepository.existsByBlockerIdAndBlockedId(request.senderId, otherId)
                || userBlockRepository.existsByBlockerIdAndBlockedId(otherId, request.senderId)) {
                throw ForbiddenException("Cannot send message to blocked user")
            }
        }

        val replyToMessage = request.replyToId?.let { replyToId ->
            val replyMsg = chatMessageRepository.findById(replyToId)
                .orElseThrow { NotFoundException("Reply target message not found: $replyToId") }
            if (replyMsg.chatRoom.id != chatRoom.id) {
                throw com.goldpet.domain.common.exception.BadRequestException("Reply target message is not in the same chat room")
            }
            replyMsg
        }

        val chatMessage = ChatMessage(
            chatRoom = chatRoom,
            sender = sender,
            messageType = request.messageType,
            textContent = request.textContent,
            fileId = request.fileId,
            emoticonId = request.emoticonId,
            emojiCode = request.emojiCode,
            replyTo = replyToMessage
        )
        val savedMessage = chatMessageRepository.save(chatMessage)

        // Send notification to other participants (not the sender)
        if (request.messageType != MessageType.SYSTEM) {
            val participants = chatRoomParticipantRepository.findAllByChatRoomId(chatRoom.id)
            val messagePreview = request.textContent?.takeIf { it.isNotBlank() } ?: when (request.messageType) {
                MessageType.IMAGE -> "사진을 보냈습니다"
                MessageType.VIDEO -> "동영상을 보냈습니다"
                MessageType.FILE -> "파일을 보냈습니다"
                MessageType.EMOTICON -> "이모티콘을 보냈습니다"
                else -> "메시지를 보냈습니다"
            }

            participants
                .filter { it.user.id != sender.id && it.leftAt == null }
                .forEach { participant ->
                    notificationService.notifyMessage(
                        toUserId = participant.user.id,
                        fromUserId = sender.id,
                        chatRoomId = chatRoom.id,
                        messagePreview = messagePreview
                    )
                }
        }

        return savedMessage
    }

    @Transactional(readOnly = true)
    fun getChatHistory(roomId: Long, page: Int, size: Int): List<ChatMessage> {
        chatRoomRepository.findById(roomId).orElseThrow { NotFoundException("Chat room not found with id: $roomId") }
        val pageable = PageRequest.of(page, size)
        return chatMessageRepository.findByChatRoomIdOrderByCreatedAtAsc(roomId, pageable)
    }

    @Transactional(readOnly = true)
    fun getUserChatRooms(userId: Long): List<ChatRoom> {
        userRepository.findById(userId).orElseThrow { NotFoundException("User not found with id: $userId") }
        val myRooms = chatRoomParticipantRepository.findAllByUserId(userId).map { it.chatRoom }
        return myRooms.filter { room ->
            val otherParticipant = room.participants.firstOrNull { it.user.id != userId }
            if (otherParticipant == null) true
            else {
                val otherId = otherParticipant.user.id
                !userBlockRepository.existsByBlockerIdAndBlockedId(userId, otherId)
                    && !userBlockRepository.existsByBlockerIdAndBlockedId(otherId, userId)
            }
        }
    }

    @Transactional
    fun markAsRead(roomId: Long, userId: Long) {
        val participant = chatRoomParticipantRepository.findByChatRoomIdAndUserId(roomId, userId)
            .orElseThrow { NotFoundException("Participant not found in chat room $roomId for user $userId") }

        participant.lastReadAt = java.time.LocalDateTime.now()
        chatRoomParticipantRepository.save(participant)
    }

    @Transactional
    fun leaveRoom(roomId: Long, userId: Long) {
        val participant = chatRoomParticipantRepository.findByChatRoomIdAndUserId(roomId, userId)
            .orElseThrow { NotFoundException("Participant not found in chat room $roomId for user $userId") }

        // Mark as left instead of deleting (soft delete)
        participant.leftAt = java.time.LocalDateTime.now()
        chatRoomParticipantRepository.save(participant)
    }

    /**
     * Get or create a direct chat room between two users based on their match.
     * If a chat room already exists for the match, return it.
     * Otherwise, create a new chat room.
     */
    @Transactional
    fun getOrCreateDirectRoom(userId: Long, targetUserId: Long): ChatRoom {
        // Block check
        if (userBlockRepository.existsByBlockerIdAndBlockedId(userId, targetUserId)
            || userBlockRepository.existsByBlockerIdAndBlockedId(targetUserId, userId)) {
            throw ForbiddenException("Blocked user")
        }

        val user = userRepository.findById(userId)
            .orElseThrow { NotFoundException("User not found: $userId") }
        val targetUser = userRepository.findById(targetUserId)
            .orElseThrow { NotFoundException("Target user not found: $targetUserId") }

        // Find match between the two users
        val match = matchRepository.findByUserIds(userId, targetUserId)
            .orElseThrow { IllegalStateException("No match exists between users $userId and $targetUserId") }

        // Check if chat room already exists for this match
        val existingRoom = chatRoomRepository.findByMatchId(match.id)
        if (existingRoom.isPresent) {
            return existingRoom.get()
        }

        // Create new chat room
        val chatRoom = ChatRoom(
            roomType = ChatRoomType.DIRECT,
            ownerUser = user,
            match = match
        )
        chatRoomRepository.save(chatRoom)

        // Add both users as participants
        chatRoomParticipantRepository.save(ChatRoomParticipant(chatRoom = chatRoom, user = user, role = ChatRoomRole.MEMBER))
        chatRoomParticipantRepository.save(ChatRoomParticipant(chatRoom = chatRoom, user = targetUser, role = ChatRoomRole.MEMBER))

        return chatRoom
    }

    /**
     * Get all active participants of a chat room.
     */
    @Transactional(readOnly = true)
    fun getParticipants(roomId: Long): List<ChatRoomParticipant> {
        return chatRoomParticipantRepository.findAllByChatRoomId(roomId)
            .filter { it.leftAt == null }
    }

    /**
     * Get pending and rejected chat requests for the current user (as target).
     */
    @Transactional(readOnly = true)
    fun getPendingRequests(userId: Long): List<ChatRequest> {
        val user = userRepository.findById(userId).orElseThrow { NotFoundException("User not found: $userId") }
        return chatRequestRepository.findByTargetUser(user)
            .filter { it.status == ChatRequestStatus.PENDING || it.status == ChatRequestStatus.REJECTED }
    }

    /**
     * Accept a chat request — creates a DIRECT chat room and links both users.
     */
    @Transactional
    fun acceptRequest(requestId: Long, userId: Long): ChatRoom {
        val request = chatRequestRepository.findById(requestId)
            .orElseThrow { NotFoundException("Chat request not found: $requestId") }

        if (request.targetUser.id != userId) {
            throw ForbiddenException("Not authorized to accept this chat request")
        }
        if (request.status != ChatRequestStatus.PENDING) {
            throw BadRequestException("Chat request is not in PENDING status")
        }

        val chatRoom = ChatRoom(
            roomType = ChatRoomType.DIRECT,
            ownerUser = request.requester
        )
        chatRoomRepository.save(chatRoom)

        chatRoomParticipantRepository.save(ChatRoomParticipant(chatRoom = chatRoom, user = request.requester, role = ChatRoomRole.MEMBER))
        chatRoomParticipantRepository.save(ChatRoomParticipant(chatRoom = chatRoom, user = request.targetUser, role = ChatRoomRole.MEMBER))

        request.status = ChatRequestStatus.ACCEPTED
        request.chatRoom = chatRoom
        request.respondedAt = LocalDateTime.now()
        chatRequestRepository.save(request)

        return chatRoom
    }

    /**
     * Reject a chat request.
     */
    @Transactional
    fun rejectRequest(requestId: Long, userId: Long) {
        val request = chatRequestRepository.findById(requestId)
            .orElseThrow { NotFoundException("Chat request not found: $requestId") }

        if (request.targetUser.id != userId) {
            throw ForbiddenException("Not authorized to reject this chat request")
        }
        if (request.status != ChatRequestStatus.PENDING) {
            throw BadRequestException("Chat request is not in PENDING status")
        }

        request.status = ChatRequestStatus.REJECTED
        request.respondedAt = LocalDateTime.now()
        chatRequestRepository.save(request)
    }

    @Transactional
    fun deleteMessage(roomId: Long, messageId: Long, userId: Long) {
        val message = chatMessageRepository.findById(messageId)
            .orElseThrow { NotFoundException("Message not found") }
        if (message.chatRoom.id != roomId) {
            throw BadRequestException("Message does not belong to this room")
        }
        if (message.sender?.id != userId) {
            throw ForbiddenException("Not authorized to delete this message")
        }
        message.softDelete()
        chatMessageRepository.save(message)
    }

    /**
     * Delete a rejected chat request.
     */
    @Transactional
    fun deleteRequest(requestId: Long, userId: Long) {
        val request = chatRequestRepository.findById(requestId)
            .orElseThrow { NotFoundException("Chat request not found: $requestId") }

        if (request.targetUser.id != userId) {
            throw ForbiddenException("Not authorized to delete this chat request")
        }
        if (request.status != ChatRequestStatus.REJECTED) {
            throw BadRequestException("Only rejected chat requests can be deleted")
        }

        chatRequestRepository.delete(request)
    }
}
