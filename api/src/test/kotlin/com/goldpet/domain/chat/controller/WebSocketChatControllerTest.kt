package com.goldpet.domain.chat.controller

import com.goldpet.domain.chat.dto.ChatMessageRequest
import com.goldpet.domain.chat.dto.ChatMessageResponse
import com.goldpet.domain.chat.entity.ChatMessage
import com.goldpet.domain.chat.entity.ChatRoom
import com.goldpet.domain.chat.entity.ChatRoomParticipant
import com.goldpet.domain.chat.entity.ChatRoomRole
import com.goldpet.domain.chat.entity.ChatRoomType
import com.goldpet.domain.chat.entity.MessageType
import com.goldpet.domain.chat.service.ChatService
import com.goldpet.domain.chat.repository.ChatRoomParticipantRepository
import com.goldpet.domain.common.repository.FileAttachmentRepository
import com.goldpet.domain.emoticon.service.EmoticonService
import com.goldpet.domain.metrics.ChatLatencyMetrics
import com.goldpet.domain.user.entity.User
import com.goldpet.config.security.UserPrincipal
import io.micrometer.core.instrument.simple.SimpleMeterRegistry
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito.*
import org.springframework.messaging.MessageDeliveryException
import org.springframework.messaging.simp.SimpMessageSendingOperations
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import java.security.Principal
import java.time.LocalDateTime
import java.util.Optional

class WebSocketChatControllerTest {

    private lateinit var simpMessageSendingOperations: SimpMessageSendingOperations
    private lateinit var chatService: ChatService
    private lateinit var emoticonService: EmoticonService
    private lateinit var fileAttachmentRepository: FileAttachmentRepository
    private lateinit var chatRoomParticipantRepository: ChatRoomParticipantRepository
    private lateinit var webSocketChatController: WebSocketChatController

    private lateinit var testUser: User
    private lateinit var testChatRoom: ChatRoom

    /** 인증된 사용자 Principal (id=1L) — STOMP CONNECT 인터셉터가 주입하는 것과 동일 형태. */
    private val principal: Principal
        get() = UsernamePasswordAuthenticationToken(UserPrincipal(testUser, null), null, emptyList())

    @BeforeEach
    fun setUp() {
        simpMessageSendingOperations = mock(SimpMessageSendingOperations::class.java)
        chatService = mock(ChatService::class.java)
        emoticonService = mock(EmoticonService::class.java)
        fileAttachmentRepository = mock(FileAttachmentRepository::class.java)
        chatRoomParticipantRepository = mock(ChatRoomParticipantRepository::class.java)
        val fileAttachmentLookupService = mock(com.goldpet.domain.common.service.FileAttachmentLookupService::class.java)
        val chatLatencyMetrics = ChatLatencyMetrics(SimpleMeterRegistry())
        webSocketChatController = WebSocketChatController(simpMessageSendingOperations, chatService, emoticonService, fileAttachmentRepository, chatRoomParticipantRepository, fileAttachmentLookupService, chatLatencyMetrics)

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
        webSocketChatController.sendMessage(request, principal)

        // Then
        verify(chatService, times(1)).saveChatMessage(request)
        verify(simpMessageSendingOperations, times(1)).convertAndSend(
            eq("/topic/chat/1"),
            any(ChatMessageResponse::class.java)
        )
    }

    @Test
    fun `sendMessage should echo clientMsgId into broadcast payload`() {
        val request = ChatMessageRequest(
            roomId = 1L,
            senderId = 1L,
            messageType = MessageType.TEXT,
            textContent = "Hello",
            clientMsgId = "abc123"
        )
        val savedMessage = ChatMessage(
            id = 99L,
            chatRoom = testChatRoom,
            sender = testUser,
            messageType = MessageType.TEXT,
            textContent = "Hello"
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }
        `when`(chatService.saveChatMessage(request)).thenReturn(savedMessage)

        webSocketChatController.sendMessage(request, principal)

        val captor = org.mockito.ArgumentCaptor.forClass(ChatMessageResponse::class.java)
        verify(simpMessageSendingOperations).convertAndSend(eq("/topic/chat/1"), captor.capture())
        org.junit.jupiter.api.Assertions.assertEquals("abc123", captor.value.clientMsgId)
    }

    @Test
    fun `sendMessage should ignore spoofed payload senderId and use authenticated principal`() {
        // EXT-CDX-002 (W1a): payload 의 senderId(999L 위조)를 무시하고 Principal(id=1L)을 사용해야 한다.
        val spoofedRequest = ChatMessageRequest(
            roomId = 1L,
            senderId = 999L, // 공격자가 위조한 발신자
            messageType = MessageType.TEXT,
            textContent = "spoofed"
        )
        val savedMessage = ChatMessage(
            id = 1L,
            chatRoom = testChatRoom,
            sender = testUser,
            messageType = MessageType.TEXT,
            textContent = "spoofed"
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }
        // 컨트롤러는 payload senderId 를 Principal(id=1L)로 덮어써 saveChatMessage 를 호출한다.
        // data class 동등성으로 senderId=1L 로 정정된 요청과만 매칭됨을 검증한다(위조 999L 무시).
        val expectedRequest = spoofedRequest.copy(senderId = 1L)
        `when`(chatService.saveChatMessage(expectedRequest)).thenReturn(savedMessage)

        webSocketChatController.sendMessage(spoofedRequest, principal)

        verify(chatService, times(1)).saveChatMessage(expectedRequest)
        verify(chatService, never()).saveChatMessage(spoofedRequest)
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
        webSocketChatController.sendMessage(request, principal)

        // Then
        verify(simpMessageSendingOperations).convertAndSend(
            eq("/topic/chat/42"),
            any(ChatMessageResponse::class.java)
        )
    }

    @Test
    fun `typing should ignore spoofed payload userId and use authenticated principal`() {
        // 독립 리뷰 MEDIUM: payload 의 userId(999L 위조)를 무시하고 Principal(id=1L)을 사용해야 한다.
        `when`(chatRoomParticipantRepository.findByChatRoomIdAndUserIdAndLeftAtIsNull(1L, 1L))
            .thenReturn(Optional.of(ChatRoomParticipant(id = 1L, chatRoom = testChatRoom, user = testUser, role = ChatRoomRole.MEMBER)))

        val spoofedEvent = TypingEvent(roomId = 1L, userId = 999L, isTyping = true)

        webSocketChatController.typing(spoofedEvent, principal)

        val captor = org.mockito.ArgumentCaptor.forClass(TypingEvent::class.java)
        verify(simpMessageSendingOperations).convertAndSend(eq("/topic/chat/1/typing"), captor.capture())
        org.junit.jupiter.api.Assertions.assertEquals(1L, captor.value.userId)
    }

    @Test
    fun `typing should reject non-participant and not broadcast`() {
        // 독립 리뷰 MEDIUM: 미참여자가 임의 방에 typing 이벤트를 발행하려 하면 거부돼야 한다.
        `when`(chatRoomParticipantRepository.findByChatRoomIdAndUserIdAndLeftAtIsNull(1L, 1L))
            .thenReturn(Optional.empty())

        val event = TypingEvent(roomId = 1L, userId = 1L, isTyping = true)

        org.junit.jupiter.api.Assertions.assertThrows(MessageDeliveryException::class.java) {
            webSocketChatController.typing(event, principal)
        }
        verify(simpMessageSendingOperations, never()).convertAndSend(anyString(), any(Any::class.java))
    }

    @Test
    fun `typing should reject a participant who left the room even though a stale row exists`() {
        // 라운드2 리뷰 MEDIUM(leftAt): old(비필터) 메서드는 일부러 present 로 스텁 — 컨트롤러가
        // 실수로 그 메서드를 쓰면 이 테스트가 통과(발행 성공)해버려 필터 누락을 잡아낸다.
        `when`(chatRoomParticipantRepository.findByChatRoomIdAndUserId(1L, 1L))
            .thenReturn(Optional.of(ChatRoomParticipant(id = 1L, chatRoom = testChatRoom, user = testUser, role = ChatRoomRole.MEMBER)))
        `when`(chatRoomParticipantRepository.findByChatRoomIdAndUserIdAndLeftAtIsNull(1L, 1L))
            .thenReturn(Optional.empty())

        val event = TypingEvent(roomId = 1L, userId = 1L, isTyping = true)

        org.junit.jupiter.api.Assertions.assertThrows(MessageDeliveryException::class.java) {
            webSocketChatController.typing(event, principal)
        }
        verify(simpMessageSendingOperations, never()).convertAndSend(anyString(), any(Any::class.java))
    }
}
