// 채팅 첫 읽음(oldLastReadAt == null) 처리 시 LocalDateTime.MIN이 아닌 epoch 기준으로 조회되는지 검증하는 회귀 테스트
package com.goldpet.domain.chat.controller

import com.goldpet.config.security.UserPrincipal
import com.goldpet.domain.chat.repository.ChatMessageRepository
import com.goldpet.domain.chat.repository.ChatRoomParticipantRepository
import com.goldpet.domain.chat.service.ChatService
import com.goldpet.domain.common.repository.FileAttachmentRepository
import com.goldpet.domain.common.service.FileAttachmentLookupService
import com.goldpet.domain.emoticon.service.EmoticonService
import com.goldpet.domain.file.service.FileService
import com.goldpet.domain.metrics.ChatLatencyMetrics
import com.goldpet.domain.user.entity.User
import io.micrometer.core.instrument.simple.SimpleMeterRegistry
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.eq
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus
import org.springframework.messaging.simp.SimpMessageSendingOperations
import java.time.LocalDateTime

class ChatRoomControllerMarkAsReadTest {

    @Mock
    private lateinit var chatService: ChatService

    @Mock
    private lateinit var fileAttachmentRepository: FileAttachmentRepository

    @Mock
    private lateinit var emoticonService: EmoticonService

    @Mock
    private lateinit var simpMessageSendingOperations: SimpMessageSendingOperations

    @Mock
    private lateinit var fileService: FileService

    @Mock
    private lateinit var chatRoomParticipantRepository: ChatRoomParticipantRepository

    @Mock
    private lateinit var chatMessageRepository: ChatMessageRepository

    @Mock
    private lateinit var fileAttachmentLookupService: FileAttachmentLookupService

    private lateinit var chatRoomController: ChatRoomController
    private lateinit var userDetails: UserPrincipal

    @BeforeEach
    fun setUp() {
        MockitoAnnotations.openMocks(this)
        val chatLatencyMetrics = ChatLatencyMetrics(SimpleMeterRegistry())

        chatRoomController = ChatRoomController(
            chatService,
            fileAttachmentRepository,
            emoticonService,
            simpMessageSendingOperations,
            fileService,
            chatRoomParticipantRepository,
            chatMessageRepository,
            fileAttachmentLookupService,
            chatLatencyMetrics
        )

        val testUser = User(
            id = 1L,
            email = "test@example.com",
            oauthProvider = "LOCAL",
            oauthId = "LOCAL_testuser",
            username = "testuser",
            password = "password",
            nickname = "테스트유저",
            name = "테스트유저",
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
        userDetails = UserPrincipal.create(testUser)
    }

    // dd85ec59: 첫 읽음(oldLastReadAt == null) 처리 시 LocalDateTime.MIN을 그대로 PG 쿼리에
    // 넘기면 pgjdbc 변환 오버플로로 "timestamp out of range" 500이 났다.
    // epoch(1970-01-01) 대체 수정이 유지되는지 고정하는 회귀 테스트.
    @Test
    fun `markAsRead should query since epoch not LocalDateTime MIN on first read`() {
        // Given: 신규 유저의 첫 읽음이라 markAsRead가 oldLastReadAt=null을 반환
        whenever(chatService.markAsRead(1L, 1L)).thenReturn(null)

        // When
        val response = chatRoomController.markAsRead(1L, userDetails)

        // Then
        assertEquals(HttpStatus.OK, response.statusCode)
        val captor = argumentCaptor<LocalDateTime>()
        verify(chatMessageRepository).findVisibleByChatRoomIdAndCreatedAtAfter(eq(1L), captor.capture())
        assertEquals(LocalDateTime.of(1970, 1, 1, 0, 0), captor.firstValue)
        assertNotEquals(LocalDateTime.MIN, captor.firstValue)
    }

    @Test
    fun `markAsRead should query since oldLastReadAt when not first read`() {
        // Given: 기존에 읽은 이력이 있는 경우 그 시각을 그대로 사용
        val previousRead = LocalDateTime.of(2026, 1, 1, 12, 0)
        whenever(chatService.markAsRead(1L, 1L)).thenReturn(previousRead)

        // When
        chatRoomController.markAsRead(1L, userDetails)

        // Then
        verify(chatMessageRepository).findVisibleByChatRoomIdAndCreatedAtAfter(1L, previousRead)
    }
}
