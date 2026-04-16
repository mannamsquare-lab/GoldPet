package com.goldpet.domain.walk.service

import com.goldpet.domain.gamification.service.BadgeAwardService
import com.goldpet.domain.gold.dto.TransactionResponse
import com.goldpet.domain.gold.entity.TransactionStatus
import com.goldpet.domain.gold.entity.TransactionType
import com.goldpet.domain.gold.service.GoldService
import com.goldpet.domain.user.entity.User
import com.goldpet.domain.user.repository.UserRepository
import com.goldpet.domain.walk.dto.CreateWalkRequest
import com.goldpet.domain.walk.dto.WalkSpotDto
import com.goldpet.domain.walk.entity.Walk
import com.goldpet.domain.walk.repository.BestWalkCoupleRepository
import com.goldpet.domain.walk.repository.WalkRepository
import com.goldpet.domain.walk.repository.WalkSpotRepository
import com.goldpet.domain.pet.repository.PetRepository
import com.goldpet.domain.friend.repository.UserBlockRepository
import com.goldpet.infra.GeocodingService
import org.junit.jupiter.api.Assertions.*
import org.springframework.context.ApplicationEventPublisher
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.locationtech.jts.geom.PrecisionModel
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.mockito.kotlin.*
import java.time.LocalDateTime
import java.util.*
import com.goldpet.domain.common.exception.*
import com.goldpet.domain.common.service.SystemSettingService
import com.goldpet.domain.walk.entity.WalkSpot
import com.goldpet.domain.walk.entity.WalkSpotType
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest

class WalkServiceTest {

    @Mock
    private lateinit var walkRepository: WalkRepository

    @Mock
    private lateinit var userRepository: UserRepository

    @Mock
    private lateinit var goldService: GoldService

    @Mock
    private lateinit var badgeAwardService: BadgeAwardService

    @Mock
    private lateinit var walkSpotRepository: WalkSpotRepository

    @Mock
    private lateinit var bestWalkCoupleRepository: BestWalkCoupleRepository

    @Mock
    private lateinit var petRepository: PetRepository

    @Mock
    private lateinit var userBlockRepository: UserBlockRepository

    @Mock
    private lateinit var geocodingService: GeocodingService

    @Mock
    private lateinit var applicationEventPublisher: ApplicationEventPublisher

    @Mock
    private lateinit var systemSettingService: SystemSettingService

    @Mock
    private lateinit var photoUrlSigner: PhotoUrlSigner

    private lateinit var walkService: WalkService

    private lateinit var testUser: User
    private val geometryFactory = GeometryFactory(PrecisionModel(), 4326)

    @BeforeEach
    fun setUp() {
        MockitoAnnotations.openMocks(this)
        walkService = WalkService(walkRepository, walkSpotRepository, bestWalkCoupleRepository, userRepository, petRepository, goldService, badgeAwardService, geocodingService, applicationEventPublisher, systemSettingService, userBlockRepository, photoUrlSigner)
        whenever(geocodingService.reverseGeocode(any(), any())).thenReturn("서울특별시 강남구")

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

    private fun mockTransactionResponse(amount: Int): TransactionResponse {
        return TransactionResponse(
            id = 1L,
            type = TransactionType.REWARD,
            amount = amount,
            balanceAfter = 100,
            description = "산책 보상",
            status = TransactionStatus.COMPLETED,
            createdAt = LocalDateTime.now()
        )
    }

    private fun createWalkRequest(distanceKm: Double): CreateWalkRequest {
        return CreateWalkRequest(
            startTime = LocalDateTime.now().minusHours(1),
            endTime = LocalDateTime.now(),
            distanceKm = distanceKm,
            durationSeconds = 3600,
            path = listOf(listOf(37.5665, 126.9780), listOf(37.5670, 126.9785)),
            caloriesBurned = null,
            notes = null
        )
    }

    private fun mockWalkSave() {
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
                walk.spots.forEach { spot -> spots.add(spot) }
            }
        }
    }

    @Test
    fun `createWalk should create walk with path and spots`() {
        val startTime = LocalDateTime.now().minusHours(1)
        val endTime = LocalDateTime.now()
        val request = CreateWalkRequest(
            startTime = startTime,
            endTime = endTime,
            distanceKm = 2.5,
            durationSeconds = 3600,
            path = listOf(
                listOf(37.5665, 126.9780),
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

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        mockWalkSave()
        whenever(goldService.grantReward(any(), any(), any())).thenReturn(mockTransactionResponse(3))
        whenever(badgeAwardService.checkAndAwardBadges(any(), any())).thenReturn(emptyList())

        val result = walkService.createWalk(1L, request)

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
        val request = createWalkRequest(2.5)
        whenever(userRepository.findById(999L)).thenReturn(Optional.empty())

        assertThrows<NotFoundException> {
            walkService.createWalk(999L, request)
        }
    }

    @Test
    fun `getWalk should return walk when exists`() {
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

        val result = walkService.getWalk(1L, 1L)

        assertNotNull(result)
        assertEquals(1L, result.id)
        assertEquals(2.5, result.distanceKm)
        assertEquals(3600, result.durationSeconds)
    }

    @Test
    fun `getWalk should throw exception when walk not found`() {
        whenever(walkRepository.findById(999L)).thenReturn(Optional.empty())

        assertThrows<NotFoundException> {
            walkService.getWalk(999L, null)
        }
    }

    @Test
    fun `getWalksByUser should return list of walks`() {
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

        whenever(walkRepository.findByUserIdOrderByStartTimeDesc(1L)).thenReturn(listOf(walk1, walk2))

        val result = walkService.getWalksByUser(1L)

        assertEquals(2, result.size)
        assertEquals(2.0, result[0].distanceKm)
        assertEquals(3.0, result[1].distanceKm)
    }

    @Test
    fun `createWalk should handle badge award error gracefully`() {
        val request = createWalkRequest(2.5)

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        mockWalkSave()
        whenever(goldService.grantReward(any(), any(), any())).thenReturn(mockTransactionResponse(3))
        whenever(badgeAwardService.checkAndAwardBadges(any(), any()))
            .thenThrow(RuntimeException("Badge award service error"))

        val result = walkService.createWalk(1L, request)

        assertNotNull(result)
        assertEquals(1L, result.id)
    }

    // === Gold Reward Tests ===

    @Test
    fun `createWalk should grant gold reward for walk over 0_5km`() {
        val request = createWalkRequest(1.5) // 1km~3km = 3 gold

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        mockWalkSave()
        whenever(goldService.grantReward(any(), any(), any())).thenReturn(mockTransactionResponse(3))
        whenever(badgeAwardService.checkAndAwardBadges(any(), any())).thenReturn(emptyList())

        walkService.createWalk(1L, request)

        verify(goldService).grantReward(eq(1L), eq(3), argThat { contains("1.5km") })
    }

    @Test
    fun `createWalk should not grant gold reward for walk under 0_5km`() {
        val request = createWalkRequest(0.3) // < 0.5km = no reward

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        mockWalkSave()
        whenever(badgeAwardService.checkAndAwardBadges(any(), any())).thenReturn(emptyList())

        walkService.createWalk(1L, request)

        verify(goldService, never()).grantReward(any(), any(), any())
    }

    @Test
    fun `createWalk should grant 10 gold for walk over 5km`() {
        val request = createWalkRequest(7.2) // >= 5km = 10 gold

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        mockWalkSave()
        whenever(goldService.grantReward(any(), any(), any())).thenReturn(mockTransactionResponse(10))
        whenever(badgeAwardService.checkAndAwardBadges(any(), any())).thenReturn(emptyList())

        walkService.createWalk(1L, request)

        verify(goldService).grantReward(eq(1L), eq(10), any())
    }

    @Test
    fun `createWalk should grant 1 gold for walk between 0_5km and 1km`() {
        val request = createWalkRequest(0.7) // 0.5~1km = 1 gold

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        mockWalkSave()
        whenever(goldService.grantReward(any(), any(), any())).thenReturn(mockTransactionResponse(1))
        whenever(badgeAwardService.checkAndAwardBadges(any(), any())).thenReturn(emptyList())

        walkService.createWalk(1L, request)

        verify(goldService).grantReward(eq(1L), eq(1), any())
    }

    @Test
    fun `getMyStats should return total gold earned via GoldService`() {
        whenever(walkRepository.sumDistanceByUserId(1L)).thenReturn(10.0)
        whenever(walkRepository.sumDurationByUserId(1L)).thenReturn(7200L)
        whenever(walkRepository.sumCaloriesByUserId(1L)).thenReturn(500.0)
        whenever(walkRepository.countByUserId(1L)).thenReturn(5)
        whenever(goldService.getTotalRewardAmount(1L)).thenReturn(30)

        val result = walkService.getMyStats(1L)

        assertEquals(10.0, result.totalDistanceKm)
        assertEquals(120L, result.totalDurationMinutes)
        assertEquals(500.0, result.totalCalories)
        assertEquals(5, result.totalWalks)
        assertEquals(30, result.totalGoldEarned)
        verify(goldService).getTotalRewardAmount(1L)
    }

    // === Presigned URL wiring ===

    private fun buildPhotoSpot(imageKey: String, hiddenFromPublic: Boolean): WalkSpot {
        val walk = Walk(
            id = 10L,
            user = testUser,
            startTime = LocalDateTime.now().minusHours(1),
            endTime = LocalDateTime.now(),
            distanceKm = 1.0,
            durationSeconds = 600,
            path = geometryFactory.createLineString(arrayOf(
                Coordinate(126.9780, 37.5665),
                Coordinate(126.9785, 37.5670)
            )),
            caloriesBurned = null,
            notes = null
        )
        val point = geometryFactory.createPoint(Coordinate(126.9781, 37.5666))
        return WalkSpot(
            id = 99L,
            walk = walk,
            location = point,
            type = WalkSpotType.PHOTO,
            timestamp = LocalDateTime.now(),
            imageUrl = imageKey,
            note = null,
            hiddenFromPublic = hiddenFromPublic
        )
    }

    @Test
    fun `getMyPhotos signs URL when flag on and returns imageKey alongside`() {
        val key = "a1b2c3d4-e5f6-7890-abcd-ef0123456789.jpg"
        val signedUrl = "https://minio.example.com/goldpet-private/$key?X-Amz-Signature=abc"
        val spot = buildPhotoSpot(key, hiddenFromPublic = false)

        whenever(photoUrlSigner.signedUrlOrNull(key)).thenReturn(signedUrl)
        whenever(walkSpotRepository.findPhotoSpotsByUserId(eq(1L), any()))
            .thenReturn(PageImpl(listOf(spot)))

        val result = walkService.getMyPhotos(1L, null, PageRequest.of(0, 20))

        assertEquals(1, result.content.size)
        val photo = result.content.first()
        assertEquals(signedUrl, photo.imageUrl)
        assertEquals(key, photo.imageKey)
    }

    @Test
    fun `getMyPhotos falls back to raw key when flag off`() {
        val key = "a1b2c3d4-e5f6-7890-abcd-ef0123456789.jpg"
        val spot = buildPhotoSpot(key, hiddenFromPublic = false)

        whenever(photoUrlSigner.signedUrlOrNull(key)).thenReturn(null)
        whenever(walkSpotRepository.findPhotoSpotsByUserId(eq(1L), any()))
            .thenReturn(PageImpl(listOf(spot)))

        val result = walkService.getMyPhotos(1L, null, PageRequest.of(0, 20))

        val photo = result.content.first()
        assertEquals(key, photo.imageUrl, "flag-off path returns raw key for backward compatibility")
        assertEquals(key, photo.imageKey)
    }

    @Test
    fun `getPublicPhotos suppresses URL when hiddenFromPublic is true`() {
        val key = "a1b2c3d4-e5f6-7890-abcd-ef0123456789.jpg"
        val hiddenSpot = buildPhotoSpot(key, hiddenFromPublic = true)

        whenever(userBlockRepository.findBlockedUserIds(1L)).thenReturn(emptyList())
        whenever(walkSpotRepository.findPublicPhotoSpots(any(), any()))
            .thenReturn(PageImpl(listOf(hiddenSpot)))

        val result = walkService.getPublicPhotos(1L, PageRequest.of(0, 20))

        val photo = result.content.first()
        assertNull(photo.imageUrl, "hidden photo in public listing must have URL suppressed")
        assertEquals(key, photo.imageKey, "imageKey is still emitted so frontend can mint on demand")
        verify(photoUrlSigner, never()).signedUrlOrNull(any())
    }

    @Test
    fun `getPublicPhotos signs URL for non-hidden photo`() {
        val key = "a1b2c3d4-e5f6-7890-abcd-ef0123456789.jpg"
        val signedUrl = "https://minio.example.com/goldpet-private/$key?X-Amz-Signature=xyz"
        val spot = buildPhotoSpot(key, hiddenFromPublic = false)

        whenever(userBlockRepository.findBlockedUserIds(1L)).thenReturn(emptyList())
        whenever(photoUrlSigner.signedUrlOrNull(key)).thenReturn(signedUrl)
        whenever(walkSpotRepository.findPublicPhotoSpots(any(), any()))
            .thenReturn(PageImpl(listOf(spot)))

        val result = walkService.getPublicPhotos(1L, PageRequest.of(0, 20))

        val photo = result.content.first()
        assertEquals(signedUrl, photo.imageUrl)
        assertEquals(key, photo.imageKey)
    }

    // === §3.7 mint endpoint ===

    private fun buildPublicPhotoSpot(
        imageKey: String,
        owner: User,
        hiddenFromPublic: Boolean,
        isPublic: Boolean = true
    ): WalkSpot {
        val walk = Walk(
            id = 10L,
            user = owner,
            startTime = LocalDateTime.now().minusHours(1),
            endTime = LocalDateTime.now(),
            distanceKm = 1.0,
            durationSeconds = 600,
            path = geometryFactory.createLineString(arrayOf(
                Coordinate(126.9780, 37.5665),
                Coordinate(126.9785, 37.5670)
            )),
            caloriesBurned = null,
            notes = null,
            isPublic = isPublic
        )
        return WalkSpot(
            id = 77L,
            walk = walk,
            location = geometryFactory.createPoint(Coordinate(126.9781, 37.5666)),
            type = WalkSpotType.PHOTO,
            timestamp = LocalDateTime.now(),
            imageUrl = imageKey,
            note = null,
            hiddenFromPublic = hiddenFromPublic
        )
    }

    @Test
    fun `mintPhotoUrl returns signed URL and imageKey for owner`() {
        val key = "a1b2c3d4-e5f6-7890-abcd-ef0123456789.jpg"
        val signedUrl = "https://minio.example.com/goldpet-private/$key?X-Amz-Signature=abc"
        val spot = buildPublicPhotoSpot(key, owner = testUser, hiddenFromPublic = false)

        whenever(walkSpotRepository.findById(77L)).thenReturn(Optional.of(spot))
        whenever(photoUrlSigner.signedUrlOrNull(key)).thenReturn(signedUrl)

        val response = walkService.mintPhotoUrl(77L, testUser.id)

        assertEquals(77L, response.spotId)
        assertEquals(signedUrl, response.imageUrl)
        assertEquals(key, response.imageKey)
        assertTrue(response.expiresAt.isAfter(LocalDateTime.now().plusMinutes(25)))
    }

    @Test
    fun `mintPhotoUrl falls back to raw key when signer returns null (flag off)`() {
        val key = "a1b2c3d4-e5f6-7890-abcd-ef0123456789.jpg"
        val spot = buildPublicPhotoSpot(key, owner = testUser, hiddenFromPublic = false)

        whenever(walkSpotRepository.findById(77L)).thenReturn(Optional.of(spot))
        whenever(photoUrlSigner.signedUrlOrNull(key)).thenReturn(null)

        val response = walkService.mintPhotoUrl(77L, testUser.id)

        assertEquals(key, response.imageUrl, "flag-off path returns raw key for backward compat")
        assertEquals(key, response.imageKey)
    }

    @Test
    fun `mintPhotoUrl allows non-owner viewer on public, not-hidden photo`() {
        val key = "a1b2c3d4-e5f6-7890-abcd-ef0123456789.jpg"
        val signedUrl = "https://minio.example.com/goldpet-private/$key?X-Amz-Signature=xyz"
        val owner = createTestUser(1L, "owner", "소유자")
        val viewer = createTestUser(2L, "viewer", "뷰어")
        val spot = buildPublicPhotoSpot(key, owner = owner, hiddenFromPublic = false)

        whenever(walkSpotRepository.findById(77L)).thenReturn(Optional.of(spot))
        whenever(userBlockRepository.findBlockedUserIds(viewer.id)).thenReturn(emptyList())
        whenever(photoUrlSigner.signedUrlOrNull(key)).thenReturn(signedUrl)

        val response = walkService.mintPhotoUrl(77L, viewer.id)

        assertEquals(signedUrl, response.imageUrl)
        assertEquals(key, response.imageKey)
    }

    @Test
    fun `mintPhotoUrl throws ForbiddenException when non-owner requests hidden photo`() {
        val key = "a1b2c3d4-e5f6-7890-abcd-ef0123456789.jpg"
        val owner = createTestUser(1L, "owner", "소유자")
        val viewer = createTestUser(2L, "viewer", "뷰어")
        val spot = buildPublicPhotoSpot(key, owner = owner, hiddenFromPublic = true)

        whenever(walkSpotRepository.findById(77L)).thenReturn(Optional.of(spot))

        assertThrows<ForbiddenException> { walkService.mintPhotoUrl(77L, viewer.id) }
        verify(photoUrlSigner, never()).signedUrlOrNull(any())
    }

    @Test
    fun `mintPhotoUrl throws ForbiddenException when non-owner requests private walk`() {
        val key = "a1b2c3d4-e5f6-7890-abcd-ef0123456789.jpg"
        val owner = createTestUser(1L, "owner", "소유자")
        val viewer = createTestUser(2L, "viewer", "뷰어")
        val spot = buildPublicPhotoSpot(key, owner = owner, hiddenFromPublic = false, isPublic = false)

        whenever(walkSpotRepository.findById(77L)).thenReturn(Optional.of(spot))

        assertThrows<ForbiddenException> { walkService.mintPhotoUrl(77L, viewer.id) }
        verify(photoUrlSigner, never()).signedUrlOrNull(any())
    }

    @Test
    fun `mintPhotoUrl throws ForbiddenException when viewer is blocked by owner`() {
        val key = "a1b2c3d4-e5f6-7890-abcd-ef0123456789.jpg"
        val owner = createTestUser(1L, "owner", "소유자")
        val viewer = createTestUser(2L, "viewer", "뷰어")
        val spot = buildPublicPhotoSpot(key, owner = owner, hiddenFromPublic = false)

        whenever(walkSpotRepository.findById(77L)).thenReturn(Optional.of(spot))
        whenever(userBlockRepository.findBlockedUserIds(viewer.id)).thenReturn(listOf(owner.id))

        assertThrows<ForbiddenException> { walkService.mintPhotoUrl(77L, viewer.id) }
        verify(photoUrlSigner, never()).signedUrlOrNull(any())
    }

    @Test
    fun `mintPhotoUrl throws NotFoundException for non-existent spot`() {
        whenever(walkSpotRepository.findById(999L)).thenReturn(Optional.empty())

        assertThrows<NotFoundException> { walkService.mintPhotoUrl(999L, 1L) }
    }
}
