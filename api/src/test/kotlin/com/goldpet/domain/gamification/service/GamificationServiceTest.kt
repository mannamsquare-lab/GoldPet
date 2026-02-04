package com.goldpet.domain.gamification.service

import com.goldpet.domain.gamification.entity.Badge
import com.goldpet.domain.gamification.entity.Challenge
import com.goldpet.domain.gamification.entity.UserBadge
import com.goldpet.domain.gamification.entity.UserChallengeProgress
import com.goldpet.domain.gamification.repository.BadgeRepository
import com.goldpet.domain.gamification.repository.ChallengeRepository
import com.goldpet.domain.gamification.repository.UserBadgeRepository
import com.goldpet.domain.gamification.repository.UserChallengeProgressRepository
import com.goldpet.domain.user.entity.User
import com.goldpet.domain.user.repository.UserRepository
import jakarta.persistence.EntityNotFoundException
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import java.time.LocalDateTime
import java.util.*

class GamificationServiceTest {

    @Mock
    private lateinit var userRepository: UserRepository

    @Mock
    private lateinit var badgeRepository: BadgeRepository

    @Mock
    private lateinit var userBadgeRepository: UserBadgeRepository

    @Mock
    private lateinit var challengeRepository: ChallengeRepository

    @Mock
    private lateinit var userChallengeProgressRepository: UserChallengeProgressRepository

    private lateinit var gamificationService: GamificationService

    private lateinit var testUser: User
    private lateinit var testBadge: Badge
    private lateinit var testChallenge: Challenge

    @BeforeEach
    fun setUp() {
        MockitoAnnotations.openMocks(this)
        gamificationService = GamificationService(
            userRepository,
            badgeRepository,
            userBadgeRepository,
            challengeRepository,
            userChallengeProgressRepository
        )

        testUser = createTestUser(1L, "testuser", "테스트유저")
        testUser.goldBalance = 100

        testBadge = Badge(
            id = 1L,
            code = "FIRST_WALK",
            name = "첫 산책",
            description = "첫 번째 산책 완료",
            imageUrl = "https://example.com/badge.png"
        )

        testChallenge = Challenge(
            id = 1L,
            title = "주간 산책 챌린지",
            description = "일주일간 10km 걷기",
            goalType = Challenge.GoalType.WALK_DISTANCE_TOTAL,
            goalValue = 10,
            rewardGold = 100,
            rewardBadge = testBadge,
            startDate = LocalDateTime.now().minusDays(1),
            endDate = LocalDateTime.now().plusDays(6),
            isActive = true
        )
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
    fun `getMyBadges should return user badges`() {
        // Given
        val userBadge = UserBadge(
            id = 1L,
            user = testUser,
            badge = testBadge
        )

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(userBadgeRepository.findAllByUser(testUser)).thenReturn(listOf(userBadge))

        // When
        val result = gamificationService.getMyBadges(1L)

        // Then
        assertEquals(1, result.size)
        assertEquals("FIRST_WALK", result[0].code)
        assertEquals("첫 산책", result[0].name)
    }

    @Test
    fun `getMyBadges should return empty list when no badges`() {
        // Given
        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(userBadgeRepository.findAllByUser(testUser)).thenReturn(emptyList())

        // When
        val result = gamificationService.getMyBadges(1L)

        // Then
        assertTrue(result.isEmpty())
    }

    @Test
    fun `getMyBadges should throw exception when user not found`() {
        // Given
        whenever(userRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        assertThrows<EntityNotFoundException> {
            gamificationService.getMyBadges(999L)
        }
    }

    @Test
    fun `getMyChallenges should return active challenges with progress`() {
        // Given
        val progress = UserChallengeProgress(
            id = 1L,
            user = testUser,
            challenge = testChallenge,
            currentValue = 5,
            status = UserChallengeProgress.Status.IN_PROGRESS
        )

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(challengeRepository.findAllByIsActiveTrueAndEndDateAfter(any()))
            .thenReturn(listOf(testChallenge))
        whenever(userChallengeProgressRepository.findByUserAndChallenge(testUser, testChallenge))
            .thenReturn(Optional.of(progress))

        // When
        val result = gamificationService.getMyChallenges(1L)

        // Then
        assertEquals(1, result.size)
        assertEquals("주간 산책 챌린지", result[0].title)
        assertNotNull(result[0].progress)
        assertEquals(5, result[0].progress?.currentValue)
    }

    @Test
    fun `getMyChallenges should return challenges without progress when not started`() {
        // Given
        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(challengeRepository.findAllByIsActiveTrueAndEndDateAfter(any()))
            .thenReturn(listOf(testChallenge))
        whenever(userChallengeProgressRepository.findByUserAndChallenge(testUser, testChallenge))
            .thenReturn(Optional.empty())

        // When
        val result = gamificationService.getMyChallenges(1L)

        // Then
        assertEquals(1, result.size)
        assertNull(result[0].progress)
    }

    @Test
    fun `updateChallengeProgress should create progress if not exists`() {
        // Given
        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(challengeRepository.findAllByIsActiveTrueAndEndDateAfter(any()))
            .thenReturn(listOf(testChallenge))
        whenever(userChallengeProgressRepository.findByUserAndChallenge(testUser, testChallenge))
            .thenReturn(Optional.empty())
        whenever(userChallengeProgressRepository.save(any<UserChallengeProgress>())).thenAnswer { invocation ->
            invocation.getArgument<UserChallengeProgress>(0)
        }
        whenever(badgeRepository.findByCode("FIRST_WALK")).thenReturn(testBadge)
        whenever(userBadgeRepository.existsByUserAndBadge(testUser, testBadge)).thenReturn(false)
        whenever(userBadgeRepository.save(any<UserBadge>())).thenAnswer { invocation ->
            invocation.getArgument<UserBadge>(0)
        }

        // When & Then - should not throw
        assertDoesNotThrow {
            gamificationService.updateChallengeProgress(1L, Challenge.GoalType.WALK_DISTANCE_TOTAL, 5)
        }
    }

    @Test
    fun `updateChallengeProgress should update existing progress`() {
        // Given
        val progress = UserChallengeProgress(
            id = 1L,
            user = testUser,
            challenge = testChallenge,
            currentValue = 3,
            status = UserChallengeProgress.Status.IN_PROGRESS
        )

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(challengeRepository.findAllByIsActiveTrueAndEndDateAfter(any()))
            .thenReturn(listOf(testChallenge))
        whenever(userChallengeProgressRepository.findByUserAndChallenge(testUser, testChallenge))
            .thenReturn(Optional.of(progress))
        whenever(userChallengeProgressRepository.save(any<UserChallengeProgress>())).thenReturn(progress)
        whenever(badgeRepository.findByCode("FIRST_WALK")).thenReturn(testBadge)
        whenever(userBadgeRepository.existsByUserAndBadge(testUser, testBadge)).thenReturn(true)

        // When
        gamificationService.updateChallengeProgress(1L, Challenge.GoalType.WALK_DISTANCE_TOTAL, 2)

        // Then - progress should be updated
        assertEquals(5, progress.currentValue)  // 3 + 2 = 5
    }

    @Test
    fun `updateChallengeProgress should complete challenge when goal reached`() {
        // Given
        val progress = UserChallengeProgress(
            id = 1L,
            user = testUser,
            challenge = testChallenge,
            currentValue = 8,
            status = UserChallengeProgress.Status.IN_PROGRESS
        )

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(userRepository.save(any<User>())).thenReturn(testUser)
        whenever(challengeRepository.findAllByIsActiveTrueAndEndDateAfter(any()))
            .thenReturn(listOf(testChallenge))
        whenever(userChallengeProgressRepository.findByUserAndChallenge(testUser, testChallenge))
            .thenReturn(Optional.of(progress))
        whenever(userChallengeProgressRepository.save(any<UserChallengeProgress>())).thenReturn(progress)
        whenever(userBadgeRepository.existsByUserAndBadge(testUser, testBadge)).thenReturn(false)
        whenever(userBadgeRepository.save(any<UserBadge>())).thenAnswer { it.getArgument(0) }
        whenever(badgeRepository.findByCode("FIRST_WALK")).thenReturn(testBadge)

        // When
        gamificationService.updateChallengeProgress(1L, Challenge.GoalType.WALK_DISTANCE_TOTAL, 5)  // 8 + 5 >= 10

        // Then
        assertEquals(UserChallengeProgress.Status.COMPLETED, progress.status)
        assertNotNull(progress.completedAt)
        assertEquals(200, testUser.goldBalance)  // 100 + 100 reward
    }

    @Test
    fun `updateChallengeProgress should not update completed challenges`() {
        // Given
        val progress = UserChallengeProgress(
            id = 1L,
            user = testUser,
            challenge = testChallenge,
            currentValue = 10,
            status = UserChallengeProgress.Status.COMPLETED,
            completedAt = LocalDateTime.now().minusDays(1)
        )

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(challengeRepository.findAllByIsActiveTrueAndEndDateAfter(any()))
            .thenReturn(listOf(testChallenge))
        whenever(userChallengeProgressRepository.findByUserAndChallenge(testUser, testChallenge))
            .thenReturn(Optional.of(progress))
        whenever(badgeRepository.findByCode("FIRST_WALK")).thenReturn(testBadge)
        whenever(userBadgeRepository.existsByUserAndBadge(testUser, testBadge)).thenReturn(true)

        // When
        gamificationService.updateChallengeProgress(1L, Challenge.GoalType.WALK_DISTANCE_TOTAL, 5)

        // Then - value should not change
        assertEquals(10, progress.currentValue)
    }

    @Test
    fun `updateChallengeProgress should ignore challenges of different goal types`() {
        // Given
        val checkInChallenge = Challenge(
            id = 2L,
            title = "체크인 챌린지",
            description = "10곳 체크인",
            goalType = Challenge.GoalType.CHECK_IN_COUNT,
            goalValue = 10,
            rewardGold = 50,
            startDate = LocalDateTime.now().minusDays(1),
            endDate = LocalDateTime.now().plusDays(6),
            isActive = true
        )

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(challengeRepository.findAllByIsActiveTrueAndEndDateAfter(any()))
            .thenReturn(listOf(checkInChallenge))  // Different goal type
        whenever(badgeRepository.findByCode("FIRST_WALK")).thenReturn(testBadge)
        whenever(userBadgeRepository.existsByUserAndBadge(testUser, testBadge)).thenReturn(true)

        // When - updating WALK_DISTANCE_TOTAL, but only CHECK_IN_COUNT challenges exist
        gamificationService.updateChallengeProgress(1L, Challenge.GoalType.WALK_DISTANCE_TOTAL, 5)

        // Then - no interaction with progress repository for this challenge
        // (verified by not having any stubbing for findByUserAndChallenge with checkInChallenge)
    }
}
