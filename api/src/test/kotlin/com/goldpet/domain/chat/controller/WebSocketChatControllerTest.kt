package com.goldpet.domain.chat.controller

import com.goldpet.domain.chat.dto.ChatMessageRequest
import com.goldpet.domain.chat.dto.ChatMessageResponse
import com.goldpet.domain.chat.entity.ChatMessage
import com.goldpet.domain.chat.entity.ChatRoom
import com.goldpet.domain.chat.entity.ChatRoomType
import com.goldpet.domain.chat.entity.MessageType
import com.goldpet.domain.chat.service.ChatService
import com.goldpet.domain.chat.repository.ChatRoomParticipantRepository
import com.goldpet.domain.common.repository.FileAttachmentRepository
import com.goldpet.domain.emoticon.service.EmoticonService
import com.goldpet.domain.user.entity.User
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito.*
import org.springframework.messaging.simp.SimpMessageSendingOperations
import java.time.LocalDateTime

class WebSocketChatControllerTest {

    private lateinit var simpMessageSendingOperations: SimpMessageSendingOperations
    private lateinit var chatService: ChatService
    private lateinit var emoticonService: EmoticonService
    private lateinit var fileAttachmentRepository: FileAttachmentRepository
    private lateinit var chatRoomParticipantRepository: ChatRoomParticipantRepository
    private lateinit var webSocketChatController: WebSocketChatController

    private lateinit var testUser: User
    private lateinit var testChatRoom: ChatRoom

    @BeforeEach
    fun setUp() {
        simpMessageSendingOperations = mock(SimpMessageSendingOperations::class.java)
        chatService = mock(ChatService::class.java)
        emoticonService = mock(EmoticonService::class.java)
        fileAttachmentRepository = mock(FileAttachmentRepository::class.java)
        chatRoomParticipantRepository = mock(ChatRoomParticipantRepository::class.java)
        webSocketChatController = WebSocketChatController(simpMessageSendingOperations, chatService, emoticonService, fileAttachmentRepository, chatRoomParticipantRepository)

        testUser = User(
            id = 1L,
            email = "test@example.com",
            oauthProvider = "GOOGLE",
            oauthId = "google123",
            username = null,
            password = null,
            nickname = "TestUser",
            name = null,
            birthDate = null,
            phoneNumber = null,
            gender = null,
            birthYear = null,
            mainLocationText = null,
            mainLocationGeom = null,
            profileImageUrl = null
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }

        testChatRoom = ChatRoom(
            id = 1L,
            roomType = ChatRoomType.DIRECT,
            title = "Test Room"
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }
    }

    @Test
    fun `sendMessage should save message and broadcast to topic`() {
        // Given
        val request = ChatMessageRequest(
            roomId = 1L,
            senderId = 1L,
            messageType = MessageType.TEXT,
            textContent = "Hello, World!"
        )

        val savedMessage = ChatMessage(
            id = 1L,
            chatRoom = testChatRoom,
            sender = testUser,
            messageType = MessageType.TEXT,
            textContent = "Hello, World!"
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }

        `when`(chatService.saveChatMessage(request)).thenReturn(savedMessage)

        // When
        webSocketChatController.sendMessage(request)

        // Then
        verify(chatService, times(1)).saveChatMessage(request)
        verify(simpMessageSendingOperations, times(1)).convertAndSend(
            eq("/topic/chat/1"),
            any(ChatMessageResponse::class.java)
        )
    }

    @Test
    fun `sendMessage should use correct topic path based on roomId`() {
        // Given
        val request = ChatMessageRequest(
            roomId = 42L,
            senderId = 1L,
            messageType = MessageType.TEXT,
            textContent = "Test message"
        )

        val room42 = ChatRoom(id = 42L, roomType = ChatRoomType.GROUP, title = "Room 42").apply {
             createdAt = LocalDateTime.now()
             updatedAt = LocalDateTime.now()
        }
        
        val savedMessage = ChatMessage(
            id = 2L,
            chatRoom = room42,
            sender = testUser,
            messageType = MessageType.TEXT,
            textContent = "Test message"
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }

        `when`(chatService.saveChatMessage(request)).thenReturn(savedMessage)

        // When
        webSocketChatController.sendMessage(request)

        // Then
        verify(simpMessageSendingOperations).convertAndSend(
            eq("/topic/chat/42"),
            any(ChatMessageResponse::class.java)
        )
    }
}
