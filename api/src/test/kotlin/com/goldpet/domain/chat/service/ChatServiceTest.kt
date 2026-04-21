package com.goldpet.domain.chat.service

import com.goldpet.domain.chat.dto.ChatMessageRequest
import com.goldpet.domain.chat.dto.ChatRoomCreateRequest
import com.goldpet.domain.chat.entity.*
import com.goldpet.domain.chat.event.ChatMessageSavedEvent
import com.goldpet.domain.chat.repository.ChatMessageRepository
import com.goldpet.domain.chat.repository.ChatRequestRepository
import com.goldpet.domain.chat.repository.ChatRoomParticipantRepository
import com.goldpet.domain.chat.repository.ChatRoomRepository
import com.goldpet.domain.friend.entity.Match
import com.goldpet.domain.friend.repository.MatchRepository
import com.goldpet.domain.friend.repository.UserBlockRepository
import com.goldpet.domain.notification.service.NotificationService
import com.goldpet.domain.user.entity.User
import com.goldpet.domain.user.repository.UserRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.ArgumentCaptor
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.mockito.kotlin.any
import org.mockito.kotlin.never
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import java.time.LocalDateTime
import java.util.*

class ChatServiceTest {

    @Mock
    private lateinit var chatRoomRepository: ChatRoomRepository

    @Mock
    private lateinit var chatMessageRepository: ChatMessageRepository

    @Mock
    private lateinit var chatRoomParticipantRepository: ChatRoomParticipantRepository

    @Mock
    private lateinit var userRepository: UserRepository

    @Mock
    private lateinit var matchRepository: MatchRepository

    @Mock
    private lateinit var notificationService: NotificationService

    @Mock
    private lateinit var userBlockRepository: UserBlockRepository

    @Mock
    private lateinit var chatRequestRepository: ChatRequestRepository

    @Mock
    private lateinit var applicationEventPublisher: ApplicationEventPublisher

    private lateinit var chatService: ChatService

    private lateinit var testUser: User
    private lateinit var targetUser: User
    private lateinit var testMatch: Match
    private lateinit var testChatRoom: ChatRoom

    @BeforeEach
    fun setUp() {
        MockitoAnnotations.openMocks(this)
        chatService = ChatService(
            chatRoomRepository,
            chatRoomParticipantRepository,
            chatMessageRepository,
            userRepository,
            matchRepository,
            notificationService,
            userBlockRepository,
            chatRequestRepository,
            applicationEventPublisher,
            // T-chat-latency-v2 Step 2: false 유지 — unit test 는 동기 fallback 경로로 기존 notification mock 검증.
            asyncNotificationEnabled = false,
        )

        testUser = createTestUser(1L, "testuser", "테스트유저")
        targetUser = createTestUser(2L, "targetuser", "대상유저")

        testMatch = Match(
            id = 1L,
            user1 = testUser,
            user2 = targetUser
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }

        testChatRoom = ChatRoom(
            id = 1L,
            roomType = ChatRoomType.DIRECT,
            title = null,
            ownerUser = testUser,
            match = testMatch
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }
    }

    private fun createTestUser(id: Long, oauthId: String, nickname: String): User {
        return User(
            id = id,
            email = "$oauthId@example.com",
            oauthProvider = "LOCAL",
            oauthId = oauthId,
            username = oauthId,
            password = "password",
            nickname = nickname,
            name = nickname,
            birthDate = null,
            phoneNumber = null,
            gender = null,
            birthYear = null,
            mainLocationText = null,
            mainLocationGeom = null,
            profileImageUrl = null
        )
    }

    @Test
    fun `createChatRoom should create direct chat room for match`() {
        // Given
        val request = ChatRoomCreateRequest(
            roomType = ChatRoomType.DIRECT,
            title = null,
            participantUserIds = listOf(2L),
            matchId = 1L
        )

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(userRepository.findById(2L)).thenReturn(Optional.of(targetUser))
        whenever(matchRepository.findById(1L)).thenReturn(Optional.of(testMatch))
        whenever(chatRoomRepository.findByMatchId(1L)).thenReturn(Optional.empty())
        whenever(chatRoomRepository.save(any<ChatRoom>())).thenAnswer { invocation ->
            val room = invocation.getArgument<ChatRoom>(0)
            ChatRoom(
                id = 1L,
                roomType = room.roomType,
                title = room.title,
                ownerUser = room.ownerUser,
                match = room.match
            ).apply {
                createdAt = LocalDateTime.now()
                updatedAt = LocalDateTime.now()
            }
        }
        whenever(chatRoomParticipantRepository.save(any<ChatRoomParticipant>())).thenAnswer { it.getArgument(0) }

        // When
        val result = chatService.createChatRoom(request, 1L)

        // Then
        assertNotNull(result)
        assertEquals(ChatRoomType.DIRECT, result.roomType)
    }

    @Test
    fun `createChatRoom should throw exception when direct room already exists`() {
        // Given
        val request = ChatRoomCreateRequest(
            roomType = ChatRoomType.DIRECT,
            participantUserIds = listOf(2L),
            matchId = 1L
        )

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(userRepository.findById(2L)).thenReturn(Optional.of(targetUser))
        whenever(matchRepository.findById(1L)).thenReturn(Optional.of(testMatch))
        whenever(chatRoomRepository.findByMatchId(1L)).thenReturn(Optional.of(testChatRoom))

        // When & Then
        assertThrows<IllegalStateException> {
            chatService.createChatRoom(request, 1L)
        }
    }

    @Test
    fun `createChatRoom should create group chat room`() {
        // Given
        val request = ChatRoomCreateRequest(
            roomType = ChatRoomType.GROUP,
            title = "그룹 채팅방",
            participantUserIds = listOf(2L)
        )

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(userRepository.findById(2L)).thenReturn(Optional.of(targetUser))
        whenever(chatRoomRepository.save(any<ChatRoom>())).thenAnswer { invocation ->
            val room = invocation.getArgument<ChatRoom>(0)
            ChatRoom(
                id = 1L,
                roomType = room.roomType,
                title = room.title,
                ownerUser = room.ownerUser,
                match = null
            ).apply {
                createdAt = LocalDateTime.now()
                updatedAt = LocalDateTime.now()
            }
        }
        whenever(chatRoomParticipantRepository.save(any<ChatRoomParticipant>())).thenAnswer { it.getArgument(0) }

        // When
        val result = chatService.createChatRoom(request, 1L)

        // Then
        assertNotNull(result)
        assertEquals(ChatRoomType.GROUP, result.roomType)
        assertEquals("그룹 채팅방", result.title)
    }

    @Test
    fun `addParticipant should add user to chat room`() {
        // Given
        whenever(chatRoomRepository.findById(1L)).thenReturn(Optional.of(testChatRoom))
        whenever(userRepository.findById(2L)).thenReturn(Optional.of(targetUser))
        whenever(chatRoomParticipantRepository.findByChatRoomIdAndUserId(1L, 2L)).thenReturn(Optional.empty())
        whenever(chatRoomParticipantRepository.save(any<ChatRoomParticipant>())).thenAnswer { invocation ->
            val participant = invocation.getArgument<ChatRoomParticipant>(0)
            ChatRoomParticipant(
                id = 1L,
                chatRoom = participant.chatRoom,
                user = participant.user,
                role = participant.role
            )
        }

        // When
        val result = chatService.addParticipant(1L, 2L)

        // Then
        assertNotNull(result)
        assertEquals(ChatRoomRole.MEMBER, result.role)
    }

    @Test
    fun `addParticipant should throw exception when user already in room`() {
        // Given
        val existingParticipant = ChatRoomParticipant(
            id = 1L,
            chatRoom = testChatRoom,
            user = targetUser,
            role = ChatRoomRole.MEMBER
        )

        whenever(chatRoomRepository.findById(1L)).thenReturn(Optional.of(testChatRoom))
        whenever(userRepository.findById(2L)).thenReturn(Optional.of(targetUser))
        whenever(chatRoomParticipantRepository.findByChatRoomIdAndUserId(1L, 2L))
            .thenReturn(Optional.of(existingParticipant))

        // When & Then
        assertThrows<IllegalStateException> {
            chatService.addParticipant(1L, 2L)
        }
    }

    @Test
    fun `saveChatMessage should save text message`() {
        // Given
        val participant = ChatRoomParticipant(
            id = 1L,
            chatRoom = testChatRoom,
            user = testUser,
            role = ChatRoomRole.MEMBER
        )

        val request = ChatMessageRequest(
            roomId = 1L,
            senderId = 1L,
            messageType = MessageType.TEXT,
            textContent = "안녕하세요!"
        )

        whenever(chatRoomRepository.findById(1L)).thenReturn(Optional.of(testChatRoom))
        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(chatRoomParticipantRepository.findByChatRoomIdAndUserId(1L, 1L))
            .thenReturn(Optional.of(participant))
        whenever(chatMessageRepository.save(any<ChatMessage>())).thenAnswer { invocation ->
            val msg = invocation.getArgument<ChatMessage>(0)
            ChatMessage(
                id = 1L,
                chatRoom = msg.chatRoom,
                sender = msg.sender,
                messageType = msg.messageType,
                textContent = msg.textContent
            ).apply {
                createdAt = LocalDateTime.now()
                updatedAt = LocalDateTime.now()
            }
        }

        // When
        val result = chatService.saveChatMessage(request)

        // Then
        assertNotNull(result)
        assertEquals(MessageType.TEXT, result.messageType)
        assertEquals("안녕하세요!", result.textContent)
    }

    @Test
    fun `saveChatMessage should throw exception when sender not participant`() {
        // Given
        val request = ChatMessageRequest(
            roomId = 1L,
            senderId = 999L,
            messageType = MessageType.TEXT,
            textContent = "안녕하세요!"
        )

        val nonParticipantUser = createTestUser(999L, "nonparticipant", "비참여자")

        whenever(chatRoomRepository.findById(1L)).thenReturn(Optional.of(testChatRoom))
        whenever(userRepository.findById(999L)).thenReturn(Optional.of(nonParticipantUser))
        whenever(chatRoomParticipantRepository.findByChatRoomIdAndUserId(1L, 999L))
            .thenReturn(Optional.empty())

        // When & Then
        assertThrows<IllegalStateException> {
            chatService.saveChatMessage(request)
        }
    }

    @Test
    fun `getChatHistory should return messages in order`() {
        // Given
        val message1 = ChatMessage(
            id = 1L,
            chatRoom = testChatRoom,
            sender = testUser,
            messageType = MessageType.TEXT,
            textContent = "첫 번째 메시지"
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }
        val message2 = ChatMessage(
            id = 2L,
            chatRoom = testChatRoom,
            sender = targetUser,
            messageType = MessageType.TEXT,
            textContent = "두 번째 메시지"
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }

        whenever(chatRoomRepository.findById(1L)).thenReturn(Optional.of(testChatRoom))
        whenever(chatMessageRepository.findByChatRoomIdOrderByCreatedAtDesc(1L, PageRequest.of(0, 50)))
            .thenReturn(PageImpl(listOf(message2, message1)))

        // When
        val result = chatService.getChatHistory(1L, 0, 50)

        // Then — DESC 결과를 reversed()하여 ASC 순서로 반환
        assertEquals(2, result.size)
        assertEquals("첫 번째 메시지", result[0].textContent)
        assertEquals("두 번째 메시지", result[1].textContent)
    }

    @Test
    fun `getUserChatRooms should return user chat rooms`() {
        // Given
        val participant = ChatRoomParticipant(
            id = 1L,
            chatRoom = testChatRoom,
            user = testUser,
            role = ChatRoomRole.MEMBER
        )

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(chatRoomParticipantRepository.findAllByUserIdAndLeftAtIsNull(1L)).thenReturn(listOf(participant))

        // When
        val result = chatService.getUserChatRooms(1L)

        // Then
        assertEquals(1, result.size)
        assertEquals(ChatRoomType.DIRECT, result[0].roomType)
    }

    // ──────────────────────────────────────────────────────────────────────────
    // T-chat-latency-v2 Step 2: 이벤트 분리 + clientMsgId 에코
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    fun `saveChatMessage async enabled — ChatMessageSavedEvent 발행되고 recipientUserIds 포함`() {
        // Given: asyncNotificationEnabled=true 인 ChatService 별도 생성
        val asyncChatService = ChatService(
            chatRoomRepository, chatRoomParticipantRepository, chatMessageRepository,
            userRepository, matchRepository, notificationService,
            userBlockRepository, chatRequestRepository,
            applicationEventPublisher,
            asyncNotificationEnabled = true,
        )

        val senderParticipant = ChatRoomParticipant(id = 1L, chatRoom = testChatRoom, user = testUser, role = ChatRoomRole.MEMBER)
        val recipientParticipant = ChatRoomParticipant(id = 2L, chatRoom = testChatRoom, user = targetUser, role = ChatRoomRole.MEMBER)
        testChatRoom.participants.addAll(listOf(senderParticipant, recipientParticipant))

        val request = ChatMessageRequest(
            roomId = 1L,
            senderId = 1L,
            messageType = MessageType.TEXT,
            textContent = "이벤트 테스트",
        )
        whenever(chatRoomRepository.findById(1L)).thenReturn(Optional.of(testChatRoom))
        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(chatRoomParticipantRepository.findByChatRoomIdAndUserId(1L, 1L))
            .thenReturn(Optional.of(senderParticipant))
        whenever(chatMessageRepository.save(any<ChatMessage>())).thenAnswer { invocation ->
            (invocation.getArgument<ChatMessage>(0)).apply {
                createdAt = LocalDateTime.now()
                updatedAt = LocalDateTime.now()
            }
        }

        // When
        asyncChatService.saveChatMessage(request)

        // Then: event 1회 발행, notificationService 직접 호출 없음
        val captor = ArgumentCaptor.forClass(ChatMessageSavedEvent::class.java)
        verify(applicationEventPublisher).publishEvent(captor.capture())
        assertEquals(listOf(2L), captor.value.recipientUserIds,
            "sender(1L) 제외한 active participant 만 recipientUserIds 에 포함")
        verify(notificationService, never()).notifyMessage(any(), any(), any(), any())
    }

    @Test
    fun `saveChatMessage async disabled — notificationService 동기 호출 이벤트 미발행`() {
        // Given: setUp() 의 chatService 는 asyncNotificationEnabled=false
        val senderParticipant = ChatRoomParticipant(id = 1L, chatRoom = testChatRoom, user = testUser, role = ChatRoomRole.MEMBER)
        val recipientParticipant = ChatRoomParticipant(id = 2L, chatRoom = testChatRoom, user = targetUser, role = ChatRoomRole.MEMBER)
        testChatRoom.participants.addAll(listOf(senderParticipant, recipientParticipant))

        val request = ChatMessageRequest(
            roomId = 1L,
            senderId = 1L,
            messageType = MessageType.TEXT,
            textContent = "동기 경로 테스트",
        )
        whenever(chatRoomRepository.findById(1L)).thenReturn(Optional.of(testChatRoom))
        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(chatRoomParticipantRepository.findByChatRoomIdAndUserId(1L, 1L))
            .thenReturn(Optional.of(senderParticipant))
        whenever(chatMessageRepository.save(any<ChatMessage>())).thenAnswer { invocation ->
            (invocation.getArgument<ChatMessage>(0)).apply {
                createdAt = LocalDateTime.now()
                updatedAt = LocalDateTime.now()
            }
        }

        // When
        chatService.saveChatMessage(request)

        // Then: 수신자(2L) 에게 직접 호출, 이벤트 발행 없음
        verify(notificationService, times(1)).notifyMessage(any(), any(), any(), any())
        verify(applicationEventPublisher, never()).publishEvent(any<Any>())
    }

    @Test
    fun `saveChatMessage clientMsgId 요청 포함 — 이벤트에 clientMsgId 에코`() {
        // Given
        val asyncChatService = ChatService(
            chatRoomRepository, chatRoomParticipantRepository, chatMessageRepository,
            userRepository, matchRepository, notificationService,
            userBlockRepository, chatRequestRepository,
            applicationEventPublisher,
            asyncNotificationEnabled = true,
        )
        val clientMsgId = "test-client-uuid-1234"

        val senderParticipant = ChatRoomParticipant(id = 1L, chatRoom = testChatRoom, user = testUser, role = ChatRoomRole.MEMBER)
        val recipientParticipant = ChatRoomParticipant(id = 2L, chatRoom = testChatRoom, user = targetUser, role = ChatRoomRole.MEMBER)
        testChatRoom.participants.addAll(listOf(senderParticipant, recipientParticipant))

        val request = ChatMessageRequest(
            roomId = 1L,
            senderId = 1L,
            messageType = MessageType.TEXT,
            textContent = "에코 테스트",
            clientMsgId = clientMsgId,
        )
        whenever(chatRoomRepository.findById(1L)).thenReturn(Optional.of(testChatRoom))
        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(chatRoomParticipantRepository.findByChatRoomIdAndUserId(1L, 1L))
            .thenReturn(Optional.of(senderParticipant))
        whenever(chatMessageRepository.save(any<ChatMessage>())).thenAnswer { invocation ->
            (invocation.getArgument<ChatMessage>(0)).apply {
                createdAt = LocalDateTime.now()
                updatedAt = LocalDateTime.now()
            }
        }

        // When
        asyncChatService.saveChatMessage(request)

        // Then: 이벤트에 clientMsgId 포함
        val captor = ArgumentCaptor.forClass(ChatMessageSavedEvent::class.java)
        verify(applicationEventPublisher).publishEvent(captor.capture())
        assertEquals(clientMsgId, captor.value.clientMsgId,
            "요청의 clientMsgId 가 이벤트 payload 에 그대로 에코되어야 함")
    }
}
