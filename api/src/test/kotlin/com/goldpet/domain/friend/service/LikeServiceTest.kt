package com.goldpet.domain.friend.service

import com.goldpet.domain.friend.entity.Like
import com.goldpet.domain.friend.entity.LikeStatus
import com.goldpet.domain.friend.repository.LikeRepository
import com.goldpet.domain.friend.repository.MatchRepository
import com.goldpet.domain.notification.service.NotificationService
import com.goldpet.domain.user.entity.User
import com.goldpet.domain.user.repository.UserRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import java.time.LocalDateTime
import java.util.*

class LikeServiceTest {

    @Mock
    private lateinit var likeRepository: LikeRepository

    @Mock
    private lateinit var matchRepository: MatchRepository

    @Mock
    private lateinit var userRepository: UserRepository

    @Mock
    private lateinit var notificationService: NotificationService

    private lateinit var likeService: LikeService

    private lateinit var testUser: User
    private lateinit var targetUser: User

    @BeforeEach
    fun setUp() {
        MockitoAnnotations.openMocks(this)
        likeService = LikeService(likeRepository, matchRepository, userRepository, notificationService)

        testUser = createTestUser(1L, "testuser", "테스트유저")
        targetUser = createTestUser(2L, "targetuser", "대상유저")
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
    fun `likeUser should create new like when not exists`() {
        // Given
        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(userRepository.findById(2L)).thenReturn(Optional.of(targetUser))
        whenever(likeRepository.findByFromUserAndToUser(testUser, targetUser)).thenReturn(Optional.empty())
        whenever(likeRepository.existsByFromUserIdAndToUserIdAndStatus(2L, 1L, LikeStatus.ACTIVE)).thenReturn(false)
        whenever(likeRepository.save(any<Like>())).thenAnswer { invocation ->
            val like = invocation.getArgument<Like>(0)
            Like(
                id = 1L,
                fromUser = like.fromUser,
                toUser = like.toUser,
                status = like.status
            ).apply {
                createdAt = LocalDateTime.now()
                updatedAt = LocalDateTime.now()
            }
        }
        whenever(notificationService.createNotification(any())).thenAnswer {
            com.goldpet.domain.notification.dto.NotificationResponse(
                id = 1L,
                type = com.goldpet.domain.notification.entity.NotificationType.LIKE,
                title = "Test",
                message = "Test message",
                targetId = null,
                targetType = null,
                isRead = false,
                senderId = null,
                senderNickname = null,
                senderProfileImage = null,
                createdAt = null
            )
        }

        // When
        val result = likeService.likeUser(1L, 2L)

        // Then
        assertNotNull(result)
        assertEquals(2L, result.toUserId)
        assertFalse(result.isMutual)
    }

    @Test
    fun `likeUser should detect mutual like`() {
        // Given
        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(userRepository.findById(2L)).thenReturn(Optional.of(targetUser))
        whenever(likeRepository.findByFromUserAndToUser(testUser, targetUser)).thenReturn(Optional.empty())
        whenever(likeRepository.existsByFromUserIdAndToUserIdAndStatus(2L, 1L, LikeStatus.ACTIVE)).thenReturn(true)
        whenever(matchRepository.findByUser1AndUser2(any(), any())).thenReturn(Optional.empty())
        whenever(matchRepository.save(any())).thenAnswer { it.getArgument(0) }
        whenever(likeRepository.save(any<Like>())).thenAnswer { invocation ->
            val like = invocation.getArgument<Like>(0)
            Like(
                id = 1L,
                fromUser = like.fromUser,
                toUser = like.toUser,
                status = like.status
            ).apply {
                createdAt = LocalDateTime.now()
                updatedAt = LocalDateTime.now()
            }
        }
        whenever(notificationService.createNotification(any())).thenAnswer {
            com.goldpet.domain.notification.dto.NotificationResponse(
                id = 1L,
                type = com.goldpet.domain.notification.entity.NotificationType.LIKE,
                title = "Test",
                message = "Test message",
                targetId = null,
                targetType = null,
                isRead = false,
                senderId = null,
                senderNickname = null,
                senderProfileImage = null,
                createdAt = null
            )
        }

        // When
        val result = likeService.likeUser(1L, 2L)

        // Then
        assertTrue(result.isMutual)
    }

    @Test
    fun `likeUser should reactivate canceled like`() {
        // Given
        val canceledLike = Like(
            id = 1L,
            fromUser = testUser,
            toUser = targetUser,
            status = LikeStatus.CANCELED
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(userRepository.findById(2L)).thenReturn(Optional.of(targetUser))
        whenever(likeRepository.findByFromUserAndToUser(testUser, targetUser)).thenReturn(Optional.of(canceledLike))
        whenever(likeRepository.existsByFromUserIdAndToUserIdAndStatus(2L, 1L, LikeStatus.ACTIVE)).thenReturn(false)
        whenever(notificationService.createNotification(any())).thenAnswer {
            com.goldpet.domain.notification.dto.NotificationResponse(
                id = 1L,
                type = com.goldpet.domain.notification.entity.NotificationType.LIKE,
                title = "Test",
                message = "Test message",
                targetId = null,
                targetType = null,
                isRead = false,
                senderId = null,
                senderNickname = null,
                senderProfileImage = null,
                createdAt = null
            )
        }

        // When
        val result = likeService.likeUser(1L, 2L)

        // Then
        assertEquals(LikeStatus.ACTIVE, canceledLike.status)
        assertFalse(result.isMutual)
    }

    @Test
    fun `likeUser should throw exception when target user not found`() {
        // Given
        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(userRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        assertThrows(IllegalArgumentException::class.java) {
            likeService.likeUser(1L, 999L)
        }
    }

    @Test
    fun `unlikeUser should cancel like`() {
        // Given
        val existingLike = Like(
            id = 1L,
            fromUser = testUser,
            toUser = targetUser,
            status = LikeStatus.ACTIVE
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(userRepository.findById(2L)).thenReturn(Optional.of(targetUser))
        whenever(likeRepository.findByFromUserAndToUser(testUser, targetUser)).thenReturn(Optional.of(existingLike))
        whenever(likeRepository.findByFromUserAndToUser(targetUser, testUser)).thenReturn(Optional.empty())
        whenever(likeRepository.save(any<Like>())).thenReturn(existingLike)
        whenever(matchRepository.findByUserIds(any(), any())).thenReturn(Optional.empty())

        // When
        val result = likeService.unlikeUser(1L, 2L)

        // Then
        assertTrue(result)
        assertEquals(LikeStatus.CANCELED, existingLike.status)
    }

    @Test
    fun `unlikeUser should return false when like not found`() {
        // Given
        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(userRepository.findById(2L)).thenReturn(Optional.of(targetUser))
        whenever(likeRepository.findByFromUserAndToUser(testUser, targetUser)).thenReturn(Optional.empty())

        // When
        val result = likeService.unlikeUser(1L, 2L)

        // Then
        assertFalse(result)
    }

    @Test
    fun `rejectLike should cancel received like`() {
        // Given - user 1 rejects like from user 2
        val receivedLike = Like(
            id = 1L,
            fromUser = targetUser,  // sender (user 2)
            toUser = testUser,      // receiver (user 1)
            status = LikeStatus.ACTIVE
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(userRepository.findById(2L)).thenReturn(Optional.of(targetUser))
        whenever(likeRepository.findByFromUserAndToUser(targetUser, testUser)).thenReturn(Optional.of(receivedLike))
        whenever(likeRepository.save(any<Like>())).thenReturn(receivedLike)

        // When - user 1 rejects like from sender 2
        val result = likeService.rejectLike(1L, 2L)

        // Then
        assertTrue(result)
        assertEquals(LikeStatus.CANCELED, receivedLike.status)
    }

    @Test
    fun `getMyLikes should return sent likes users`() {
        // Given
        val sentLike = Like(
            id = 1L,
            fromUser = testUser,
            toUser = targetUser,
            status = LikeStatus.ACTIVE
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }

        whenever(likeRepository.findSentOnlyLikes(1L)).thenReturn(listOf(sentLike))

        // When
        val result = likeService.getMyLikes(1L)

        // Then
        assertEquals(1, result.size)
        assertEquals(2L, result[0].id)
    }

    @Test
    fun `getMutualLikes should return mutual likes users`() {
        // Given
        val mutualLike = Like(
            id = 1L,
            fromUser = testUser,
            toUser = targetUser,
            status = LikeStatus.ACTIVE
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }

        whenever(likeRepository.findMutualLikes(1L)).thenReturn(listOf(mutualLike))

        // When
        val result = likeService.getMutualLikes(1L)

        // Then
        assertEquals(1, result.size)
    }

    @Test
    fun `getReceivedLikes should return received likes users`() {
        // Given
        val receivedLike = Like(
            id = 1L,
            fromUser = targetUser,
            toUser = testUser,
            status = LikeStatus.ACTIVE
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }

        whenever(likeRepository.findReceivedOnlyLikes(1L)).thenReturn(listOf(receivedLike))

        // When
        val result = likeService.getReceivedLikes(1L)

        // Then
        assertEquals(1, result.size)
        assertEquals(2L, result[0].id)
    }

    @Test
    fun `hasLiked should return true when like exists`() {
        // Given
        whenever(likeRepository.existsByFromUserIdAndToUserIdAndStatus(1L, 2L, LikeStatus.ACTIVE)).thenReturn(true)

        // When
        val result = likeService.hasLiked(1L, 2L)

        // Then
        assertTrue(result)
    }

    @Test
    fun `hasLiked should return false when like does not exist`() {
        // Given
        whenever(likeRepository.existsByFromUserIdAndToUserIdAndStatus(1L, 2L, LikeStatus.ACTIVE)).thenReturn(false)

        // When
        val result = likeService.hasLiked(1L, 2L)

        // Then
        assertFalse(result)
    }
}
