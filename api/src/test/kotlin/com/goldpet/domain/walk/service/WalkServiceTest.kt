package com.goldpet.domain.walk.service

import com.goldpet.domain.gamification.service.GamificationService
import com.goldpet.domain.user.entity.User
import com.goldpet.domain.user.repository.UserRepository
import com.goldpet.domain.walk.dto.CreateWalkRequest
import com.goldpet.domain.walk.dto.WalkSpotDto
import com.goldpet.domain.walk.entity.Walk
import com.goldpet.domain.walk.repository.WalkRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.locationtech.jts.geom.PrecisionModel
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.mockito.kotlin.any
import org.mockito.kotlin.doNothing
import org.mockito.kotlin.whenever
import java.time.LocalDateTime
import java.util.*
import jakarta.persistence.EntityNotFoundException

class WalkServiceTest {

    @Mock
    private lateinit var walkRepository: WalkRepository

    @Mock
    private lateinit var userRepository: UserRepository

    @Mock
    private lateinit var gamificationService: GamificationService

    private lateinit var walkService: WalkService

    private lateinit var testUser: User
    private val geometryFactory = GeometryFactory(PrecisionModel(), 4326)

    @BeforeEach
    fun setUp() {
        MockitoAnnotations.openMocks(this)
        walkService = WalkService(walkRepository, userRepository, gamificationService)

        testUser = createTestUser(1L, "testuser", "테스트유저")
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
    fun `createWalk should create walk with path and spots`() {
        // Given
        val startTime = LocalDateTime.now().minusHours(1)
        val endTime = LocalDateTime.now()
        val request = CreateWalkRequest(
            startTime = startTime,
            endTime = endTime,
            distanceKm = 2.5,
            durationSeconds = 3600,
            path = listOf(
                listOf(37.5665, 126.9780),  // 서울시청 근처
                listOf(37.5670, 126.9785),
                listOf(37.5675, 126.9790)
            ),
            spots = listOf(
                WalkSpotDto(
                    latitude = 37.5668,
                    longitude = 126.9783,
                    type = "PEE",
                    timestamp = startTime.plusMinutes(30),
                    imageUrl = null,
                    note = "공원 근처"
                )
            ),
            caloriesBurned = 150.0,
            notes = "오늘 산책 좋았음"
        )

        val lineString = geometryFactory.createLineString(arrayOf(
            Coordinate(126.9780, 37.5665),
            Coordinate(126.9785, 37.5670),
            Coordinate(126.9790, 37.5675)
        ))

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(walkRepository.save(any<Walk>())).thenAnswer { invocation ->
            val walk = invocation.getArgument<Walk>(0)
            Walk(
                id = 1L,
                user = walk.user,
                startTime = walk.startTime,
                endTime = walk.endTime,
                distanceKm = walk.distanceKm,
                durationSeconds = walk.durationSeconds,
                path = walk.path,
                caloriesBurned = walk.caloriesBurned,
                notes = walk.notes
            ).apply {
                createdAt = LocalDateTime.now()
                updatedAt = LocalDateTime.now()
                // Copy spots from the original walk
                walk.spots.forEach { spot ->
                    spots.add(spot)
                }
            }
        }
        doNothing().whenever(gamificationService).updateChallengeProgress(any(), any(), any())

        // When
        val result = walkService.createWalk(1L, request)

        // Then
        assertNotNull(result)
        assertEquals(1L, result.id)
        assertEquals(1L, result.userId)
        assertEquals(2.5, result.distanceKm)
        assertEquals(3600, result.durationSeconds)
        assertEquals(150.0, result.caloriesBurned)
        assertEquals("오늘 산책 좋았음", result.notes)
        assertEquals(3, result.path.size)
        assertEquals(1, result.spots.size)
        assertEquals("PEE", result.spots[0].type)
    }

    @Test
    fun `createWalk should throw exception when user not found`() {
        // Given
        val request = CreateWalkRequest(
            startTime = LocalDateTime.now().minusHours(1),
            endTime = LocalDateTime.now(),
            distanceKm = 2.5,
            durationSeconds = 3600,
            path = listOf(listOf(37.5665, 126.9780), listOf(37.5670, 126.9785)),
            caloriesBurned = null,
            notes = null
        )
        whenever(userRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        assertThrows<EntityNotFoundException> {
            walkService.createWalk(999L, request)
        }
    }

    @Test
    fun `getWalk should return walk when exists`() {
        // Given
        val lineString = geometryFactory.createLineString(arrayOf(
            Coordinate(126.9780, 37.5665),
            Coordinate(126.9785, 37.5670),
            Coordinate(126.9790, 37.5675)
        ))

        val walk = Walk(
            id = 1L,
            user = testUser,
            startTime = LocalDateTime.now().minusHours(1),
            endTime = LocalDateTime.now(),
            distanceKm = 2.5,
            durationSeconds = 3600,
            path = lineString,
            caloriesBurned = 150.0,
            notes = "좋은 산책"
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }

        whenever(walkRepository.findById(1L)).thenReturn(Optional.of(walk))

        // When
        val result = walkService.getWalk(1L)

        // Then
        assertNotNull(result)
        assertEquals(1L, result.id)
        assertEquals(2.5, result.distanceKm)
        assertEquals(3600, result.durationSeconds)
    }

    @Test
    fun `getWalk should throw exception when walk not found`() {
        // Given
        whenever(walkRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        assertThrows<EntityNotFoundException> {
            walkService.getWalk(999L)
        }
    }

    @Test
    fun `getWalksByUser should return list of walks`() {
        // Given
        val lineString = geometryFactory.createLineString(arrayOf(
            Coordinate(126.9780, 37.5665),
            Coordinate(126.9785, 37.5670)
        ))

        val walk1 = Walk(
            id = 1L,
            user = testUser,
            startTime = LocalDateTime.now().minusDays(1),
            endTime = LocalDateTime.now().minusDays(1).plusHours(1),
            distanceKm = 2.0,
            durationSeconds = 3600,
            path = lineString,
            caloriesBurned = null,
            notes = null
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }

        val walk2 = Walk(
            id = 2L,
            user = testUser,
            startTime = LocalDateTime.now().minusHours(2),
            endTime = LocalDateTime.now().minusHours(1),
            distanceKm = 3.0,
            durationSeconds = 3600,
            path = lineString,
            caloriesBurned = null,
            notes = null
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }

        whenever(walkRepository.findByUserId(1L)).thenReturn(listOf(walk1, walk2))

        // When
        val result = walkService.getWalksByUser(1L)

        // Then
        assertEquals(2, result.size)
        assertEquals(2.0, result[0].distanceKm)
        assertEquals(3.0, result[1].distanceKm)
    }

    @Test
    fun `createWalk should handle gamification error gracefully`() {
        // Given
        val request = CreateWalkRequest(
            startTime = LocalDateTime.now().minusHours(1),
            endTime = LocalDateTime.now(),
            distanceKm = 2.5,
            durationSeconds = 3600,
            path = listOf(listOf(37.5665, 126.9780), listOf(37.5670, 126.9785)),
            caloriesBurned = null,
            notes = null
        )

        val lineString = geometryFactory.createLineString(arrayOf(
            Coordinate(126.9780, 37.5665),
            Coordinate(126.9785, 37.5670)
        ))

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(walkRepository.save(any<Walk>())).thenAnswer { invocation ->
            val walk = invocation.getArgument<Walk>(0)
            Walk(
                id = 1L,
                user = walk.user,
                startTime = walk.startTime,
                endTime = walk.endTime,
                distanceKm = walk.distanceKm,
                durationSeconds = walk.durationSeconds,
                path = walk.path,
                caloriesBurned = walk.caloriesBurned,
                notes = walk.notes
            ).apply {
                createdAt = LocalDateTime.now()
                updatedAt = LocalDateTime.now()
            }
        }
        whenever(gamificationService.updateChallengeProgress(any(), any(), any()))
            .thenThrow(RuntimeException("Gamification service error"))

        // When - should not throw exception even if gamification fails
        val result = walkService.createWalk(1L, request)

        // Then
        assertNotNull(result)
        assertEquals(1L, result.id)
    }
}
