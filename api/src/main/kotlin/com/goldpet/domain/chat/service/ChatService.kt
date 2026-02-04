package com.goldpet.domain.chat.service

import com.goldpet.domain.chat.dto.ChatRoomCreateRequest
import com.goldpet.domain.chat.dto.ChatMessageRequest
import com.goldpet.domain.chat.entity.*
import com.goldpet.domain.chat.repository.ChatMessageRepository
import com.goldpet.domain.chat.repository.ChatRoomParticipantRepository
import com.goldpet.domain.chat.repository.ChatRoomRepository
import com.goldpet.domain.friend.repository.MatchRepository
import com.goldpet.domain.user.repository.UserRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ChatService(
    private val chatRoomRepository: ChatRoomRepository,
    private val chatRoomParticipantRepository: ChatRoomParticipantRepository,
    private val chatMessageRepository: ChatMessageRepository,
    private val userRepository: UserRepository,
    private val matchRepository: MatchRepository
) {

    @Transactional
    fun createChatRoom(request: ChatRoomCreateRequest, creatorId: Long): ChatRoom {
        val creator = userRepository.findById(creatorId).orElseThrow { NoSuchElementException("User not found with id: $creatorId") }

        // Handle DIRECT chat room creation
        if (request.roomType == ChatRoomType.DIRECT) {
            val targetUserId = request.participantUserIds.firstOrNull()
                ?: throw IllegalArgumentException("Direct chat room requires a target user ID.")
            val targetUser = userRepository.findById(targetUserId).orElseThrow { NoSuchElementException("Target user not found with id: $targetUserId") }

            // Find existing match
            val match = request.matchId?.let { matchRepository.findById(it).orElse(null) }
                ?: throw IllegalArgumentException("Direct chat room requires a valid match ID.")

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
                    val user = userRepository.findById(userId).orElseThrow { NoSuchElementException("Participant user not found with id: $userId") }
                    chatRoomParticipantRepository.save(ChatRoomParticipant(chatRoom = chatRoom, user = user, role = ChatRoomRole.MEMBER))
                }
            }
            return chatRoom
        }
    }

    @Transactional
    fun addParticipant(roomId: Long, userId: Long, role: ChatRoomRole = ChatRoomRole.MEMBER): ChatRoomParticipant {
        val chatRoom = chatRoomRepository.findById(roomId).orElseThrow { NoSuchElementException("Chat room not found with id: $roomId") }
        val user = userRepository.findById(userId).orElseThrow { NoSuchElementException("User not found with id: $userId") }

        if (chatRoomParticipantRepository.findByChatRoomIdAndUserId(roomId, userId).isPresent) {
            throw IllegalStateException("User ${user.nickname} is already a participant in chat room ${chatRoom.title}.")
        }

        val participant = ChatRoomParticipant(chatRoom = chatRoom, user = user, role = role)
        return chatRoomParticipantRepository.save(participant)
    }

    @Transactional
    fun removeParticipant(roomId: Long, userId: Long) {
        val participant = chatRoomParticipantRepository.findByChatRoomIdAndUserId(roomId, userId)
            .orElseThrow { NoSuchElementException("Participant not found in chat room $roomId for user $userId") }
        chatRoomParticipantRepository.delete(participant)
    }

    @Transactional
    fun saveChatMessage(request: ChatMessageRequest): ChatMessage {
        val chatRoom = chatRoomRepository.findById(request.roomId).orElseThrow { NoSuchElementException("Chat room not found with id: ${request.roomId}") }
        // request.senderId might be null if System message? 
        // Warning said 'Unnecessary safe call on non-null receiver of type Long' at 101:38. 
        // 101:38 is `request.senderId?.let`. 
        // If request.senderId IS Long (not Long?), then why `?.let`?
        // Let's assume request.senderId IS Nullable Long based on `ChatMessageRequest`. 
        // Wait, if warning says "non-null receiver of type Long", it means compiler thinks it is NOT null.
        // So `request.senderId` must be `Long`.
        // If so, `request.senderId` is not null.
        val sender = userRepository.findById(request.senderId).orElseThrow { NoSuchElementException("Sender user not found with id: ${request.senderId}") }

        // Validate sender is a participant if not a system message
        if (request.messageType != MessageType.SYSTEM) {
           // sender is guaranteed not null here if line above succeeded
            chatRoomParticipantRepository.findByChatRoomIdAndUserId(chatRoom.id, sender.id)
                .orElseThrow { IllegalStateException("Sender is not a participant of this chat room.") }
        }

        val chatMessage = ChatMessage(
            chatRoom = chatRoom,
            sender = sender,
            messageType = request.messageType,
            textContent = request.textContent,
            fileId = request.fileId,
            emoticonId = request.emoticonId,
            emojiCode = request.emojiCode
        )
        return chatMessageRepository.save(chatMessage)
    }

    @Transactional(readOnly = true)
    fun getChatHistory(roomId: Long, page: Int, size: Int): List<ChatMessage> {
        chatRoomRepository.findById(roomId).orElseThrow { NoSuchElementException("Chat room not found with id: $roomId") }
        val pageable = PageRequest.of(page, size)
        return chatMessageRepository.findByChatRoomIdOrderByCreatedAtAsc(roomId, pageable)
    }

    @Transactional(readOnly = true)
    fun getUserChatRooms(userId: Long): List<ChatRoom> {
        userRepository.findById(userId).orElseThrow { NoSuchElementException("User not found with id: $userId") }
        return chatRoomParticipantRepository.findAllByUserId(userId).map { it.chatRoom }
    }

    @Transactional
    fun markAsRead(roomId: Long, userId: Long) {
        val participant = chatRoomParticipantRepository.findByChatRoomIdAndUserId(roomId, userId)
            .orElseThrow { NoSuchElementException("Participant not found in chat room $roomId for user $userId") }

        participant.lastReadAt = java.time.LocalDateTime.now()
        chatRoomParticipantRepository.save(participant)
    }

    @Transactional
    fun leaveRoom(roomId: Long, userId: Long) {
        val participant = chatRoomParticipantRepository.findByChatRoomIdAndUserId(roomId, userId)
            .orElseThrow { NoSuchElementException("Participant not found in chat room $roomId for user $userId") }

        // Mark as left instead of deleting (soft delete)
        participant.leftAt = java.time.LocalDateTime.now()
        chatRoomParticipantRepository.save(participant)
    }
}
