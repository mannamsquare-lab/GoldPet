package com.goldpet.domain.walk.service

import com.goldpet.domain.gamification.entity.BadgeConditionType
import com.goldpet.domain.gamification.service.BadgeAwardService
import com.goldpet.domain.common.exception.*
import com.goldpet.domain.gold.service.GoldService
import com.goldpet.domain.pet.repository.PetRepository
import com.goldpet.domain.user.repository.UserRepository
import com.goldpet.domain.friend.repository.UserBlockRepository
import com.goldpet.domain.walk.dto.CreateWalkRequest
import com.goldpet.domain.walk.dto.WalkPhotoResponse
import com.goldpet.domain.walk.dto.WalkResponse
import com.goldpet.domain.walk.dto.BoundingBoxRequest
import com.goldpet.domain.common.util.toHttps
import com.goldpet.domain.walk.dto.WalkRankingResponse
import com.goldpet.domain.walk.dto.WalkCoupleRankingResponse
import com.goldpet.domain.walk.entity.Walk
import com.goldpet.domain.walk.entity.WalkPet
import com.goldpet.domain.walk.repository.WalkRepository
import com.goldpet.domain.walk.repository.WalkSpotRepository
import com.goldpet.domain.walk.repository.BestWalkCoupleRepository
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.locationtech.jts.geom.PrecisionModel
import com.goldpet.domain.walk.event.WalkCompletedEvent
import com.goldpet.domain.common.service.SystemSettingService
import com.goldpet.infra.GeocodingService
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class WalkService(
    private val walkRepository: WalkRepository,
    private val walkSpotRepository: WalkSpotRepository,
    private val bestWalkCoupleRepository: BestWalkCoupleRepository,
    private val userRepository: UserRepository,
    private val petRepository: PetRepository,
    private val goldService: GoldService,
    private val badgeAwardService: BadgeAwardService,
    private val geocodingService: GeocodingService,
    private val applicationEventPublisher: ApplicationEventPublisher,
    private val systemSettingService: SystemSettingService,
    private val userBlockRepository: UserBlockRepository,
    private val photoUrlSigner: PhotoUrlSigner
) {
    private val log = LoggerFactory.getLogger(WalkService::class.java)

    @Transactional
    fun createWalk(userId: Long, request: CreateWalkRequest): WalkResponse {
        // 산책 최소 저장 조건 검증
        val minDuration = systemSettingService.getInt("WALK_MIN_DURATION_SECONDS", 30)
        val minDistance = systemSettingService.getInt("WALK_MIN_DISTANCE_METERS", 10)
        val distanceMeters = (request.distanceKm * 1000).toInt()
        if (request.durationSeconds < minDuration || distanceMeters < minDistance) {
            throw BadRequestException(
                "산책 저장 조건 미충족: ${minDuration}초 이상, ${minDistance}m 이상 필요 " +
                "(현재: ${request.durationSeconds}초, ${distanceMeters}m)"
            )
        }

        val user = userRepository.findById(userId).orElseThrow { NotFoundException("User not found") }

        val walk = Walk(
            user = user,
            startTime = request.startTime,
            endTime = request.endTime,
            distanceKm = request.distanceKm,
            durationSeconds = request.durationSeconds,
            path = request.toLineString(),
            caloriesBurned = request.caloriesBurned,
            notes = request.notes,
            isPublic = request.isPublic
        )
        walk.followedCourseId = request.followedCourseId
        
        // Add spots
        val geometryFactory = GeometryFactory(PrecisionModel(), 4326)
        request.spots.forEach { spotDto ->
            val point = geometryFactory.createPoint(Coordinate(spotDto.longitude, spotDto.latitude))
            walk.spots.add(com.goldpet.domain.walk.entity.WalkSpot(
                walk = walk,
                location = point,
                type = com.goldpet.domain.walk.entity.WalkSpotType.valueOf(spotDto.type),
                timestamp = spotDto.timestamp,
                imageUrl = spotDto.imageUrl,
                note = spotDto.note
            ))
        }

        // Derive start/end locations from path (server-side, not from client)
        val startCoord = request.path.firstOrNull()
        val endCoord = request.path.lastOrNull()
        if (startCoord != null) {
            walk.startLocation = geometryFactory.createPoint(Coordinate(startCoord[1], startCoord[0])) // [lon, lat]
            try {
                val geocodeResult = geocodingService.reverseGeocodeStructured(startCoord[0], startCoord[1])
                walk.startAddress = geocodeResult.fullAddress
                walk.province = geocodeResult.province
            } catch (e: Exception) {
                // Geocoding failure is non-fatal — walk save continues
                log.warn("Reverse geocoding failed for walk start: {}", e.message)
            }
        }
        if (endCoord != null) {
            walk.endLocation = geometryFactory.createPoint(Coordinate(endCoord[1], endCoord[0])) // [lon, lat]
            try {
                walk.endAddress = geocodingService.reverseGeocode(endCoord[0], endCoord[1])
            } catch (e: Exception) {
                log.warn("Reverse geocoding failed for walk end: {}", e.message)
            }
        }

        // Resolve pet ownership and create WalkPet associations
        if (request.petIds.isNotEmpty()) {
            val ownedPets = petRepository.findByOwnerId(userId).filter { it.id in request.petIds }
            walk.walkPets = ownedPets.map { WalkPet(walk = walk, pet = it) }.toMutableList()
        }

        val savedWalk = walkRepository.save(walk)

        // 산책 골드 보상 (거리 기반) — walk save와 원자적: 골드 실패 시 walk도 롤백
        val goldReward = calculateWalkReward(savedWalk.distanceKm)
        if (goldReward > 0) {
            goldService.grantReward(userId, goldReward, "산책 완료 보상 (${String.format("%.1f", savedWalk.distanceKm)}km)")
        }

        // Evaluate badge award conditions
        try {
            badgeAwardService.checkAndAwardBadges(userId, BadgeConditionType.WALK_COUNT)
            badgeAwardService.checkAndAwardBadges(userId, BadgeConditionType.WALK_DISTANCE_TOTAL)
        } catch (e: Exception) {
            log.warn("Failed to update gamification progress", e)
        }

        applicationEventPublisher.publishEvent(WalkCompletedEvent(this, savedWalk.id, userId, savedWalk.followedCourseId))

        return WalkResponse.from(savedWalk)
    }

    fun getWalk(walkId: Long, currentUserId: Long?): WalkResponse {
        val walk = walkRepository.findById(walkId).orElseThrow { NotFoundException("Walk not found") }
        val isOwner = currentUserId != null && walk.user.id == currentUserId
        if (isOwner) {
            return WalkResponse.from(walk)
        }
        if (!walk.isPublic) {
            throw ForbiddenException("This walk is private")
        }
        return WalkResponse.publicFrom(walk)
    }

    fun getPublicWalks(pageable: org.springframework.data.domain.Pageable, yearMonth: String? = null, userId: Long? = null, province: String? = null): org.springframework.data.domain.Page<WalkResponse> {
        val walks = if (userId != null && yearMonth != null) {
            val (start, end) = parseYearMonth(yearMonth)
            walkRepository.findPublicWalksByUserIdAndMonth(userId, start, end, province, pageable)
        } else if (userId != null) {
            walkRepository.findPublicWalksByUserId(userId, province, pageable)
        } else if (yearMonth != null) {
            val (start, end) = parseYearMonth(yearMonth)
            walkRepository.findPublicWalksByMonth(start, end, province, pageable)
        } else {
            walkRepository.findPublicWalks(province, pageable)
        }
        return walks.map { WalkResponse.publicFrom(it) }
    }

    fun getWalksByUser(userId: Long): List<WalkResponse> {
        val walks = walkRepository.findByUserIdOrderByStartTimeDesc(userId)
        return walks.map { WalkResponse.from(it) }
    }

    fun getWalksByUser(userId: Long, pageable: org.springframework.data.domain.Pageable, yearMonth: String? = null): org.springframework.data.domain.Page<WalkResponse> {
        val walks = if (yearMonth != null) {
            val (start, end) = parseYearMonth(yearMonth)
            walkRepository.findByUserIdAndMonth(userId, start, end, pageable)
        } else {
            walkRepository.findByUserIdOrderByStartTimeDesc(userId, pageable)
        }
        return walks.map { WalkResponse.from(it) }
    }

    fun findWalksInArea(request: BoundingBoxRequest): List<WalkResponse> {
        val walks = walkRepository.findWalksWithinBoundingBox(
            request.minLat,
            request.minLon,
            request.maxLat,
            request.maxLon
        )
        return walks.map { WalkResponse.from(it) }
    }

    fun getWalkRanking(period: String, pageable: org.springframework.data.domain.Pageable, province: String? = null): List<WalkRankingResponse> {
        val since = when (period) {
            "monthly" -> java.time.LocalDateTime.now().minusDays(30)
            else -> java.time.LocalDateTime.now().minusDays(7) // weekly default
        }

        val results = walkRepository.findRankingsSince(since, province, pageable)
        return results.mapIndexed { index, row ->
            WalkRankingResponse(
                rank = index + 1,
                userId = (row[0] as Number).toLong(),
                nickname = row[1] as String,
                profileImageUrl = (row[2] as? String).toHttps(),
                petName = null,
                petProfileImageUrl = null,
                totalDistanceKm = (row[3] as Number).toDouble(),
                totalMinutes = 0L,
                totalGold = 0,
                walkCount = (row[4] as Number).toInt()
            )
        }
    }

    fun getCalendarRanking(yearMonth: String, pageable: org.springframework.data.domain.Pageable, province: String? = null): WalkCoupleRankingResponse {
        val (year, month) = yearMonth.split("-").map { it.toInt() }
        val startOfMonth = java.time.LocalDateTime.of(year, month, 1, 0, 0, 0)
        val startOfNextMonth = startOfMonth.plusMonths(1)

        val results = walkRepository.findCalendarRankings(startOfMonth, startOfNextMonth, province, pageable)
        val rankings = results.mapIndexed { index, row ->
            WalkRankingResponse(
                rank = index + 1,
                userId = (row[0] as Number).toLong(),
                nickname = row[1] as String,
                profileImageUrl = (row[2] as? String).toHttps(),
                // row[3] is petId (skip for public ranking response)
                petName = row[4] as? String,
                petProfileImageUrl = (row[5] as? String).toHttps(),
                totalDistanceKm = (row[6] as Number).toDouble(),
                totalMinutes = (row[7] as Number).toLong(),
                totalGold = (row[8] as Number).toInt(),
                walkCount = (row[9] as Number).toInt()
            )
        }

        val bestCoupleEntity = bestWalkCoupleRepository.findByYearMonth(yearMonth)
        val bestCouple = bestCoupleEntity?.let { couple ->
            rankings.find { it.userId == couple.user.id }
                ?: walkRepository.findCalendarRankingForUser(startOfMonth, startOfNextMonth, couple.user.id, province)?.takeIf { it.isNotEmpty() }?.let { row ->
                    WalkRankingResponse(
                        rank = 0,
                        userId = (row[0] as Number).toLong(),
                        nickname = row[1] as String,
                        profileImageUrl = (row[2] as? String).toHttps(),
                        petName = row[4] as? String,
                        petProfileImageUrl = (row[5] as? String).toHttps(),
                        totalDistanceKm = (row[6] as Number).toDouble(),
                        totalMinutes = (row[7] as Number).toLong(),
                        totalGold = (row[8] as Number).toInt(),
                        walkCount = (row[9] as Number).toInt()
                    )
                }
        }

        return WalkCoupleRankingResponse(
            yearMonth = yearMonth,
            bestCouple = bestCouple,
            rankings = rankings
        )
    }

    fun getMyStats(userId: Long): com.goldpet.domain.walk.dto.WalkStatsResponse {
        val totalDistance = walkRepository.sumDistanceByUserId(userId)
        val totalDuration = walkRepository.sumDurationByUserId(userId)
        val totalCalories = walkRepository.sumCaloriesByUserId(userId)
        val totalWalks = walkRepository.countByUserId(userId)
        val totalGold = goldService.getTotalRewardAmount(userId)

        return com.goldpet.domain.walk.dto.WalkStatsResponse(
            totalDistanceKm = totalDistance,
            totalDurationMinutes = totalDuration / 60,
            totalCalories = totalCalories,
            totalGoldEarned = totalGold,
            totalWalks = totalWalks
        )
    }

    fun getMyPhotos(userId: Long, yearMonth: String?, pageable: org.springframework.data.domain.Pageable): org.springframework.data.domain.Page<WalkPhotoResponse> {
        val spots = if (yearMonth != null) {
            val (start, end) = parseYearMonth(yearMonth)
            walkSpotRepository.findPhotoSpotsByUserIdAndMonth(userId, start, end, pageable)
        } else {
            walkSpotRepository.findPhotoSpotsByUserId(userId, pageable)
        }
        return spots.map { spot -> toWalkPhotoResponse(spot) }
    }

    @Transactional
    fun updateSpotNote(userId: Long, walkId: Long, spotId: Long, note: String?): WalkPhotoResponse {
        val walk = walkRepository.findById(walkId).orElseThrow { NotFoundException("Walk not found") }
        if (walk.user.id != userId) throw ForbiddenException("Not the owner of this walk")
        val spot = walkSpotRepository.findById(spotId).orElseThrow { NotFoundException("Spot not found") }
        if (spot.walk.id != walkId) throw ForbiddenException("Spot does not belong to this walk")
        spot.note = note
        return toWalkPhotoResponse(spot)
    }

    fun getPublicPhotos(userId: Long, pageable: org.springframework.data.domain.Pageable): org.springframework.data.domain.Page<WalkPhotoResponse> {
        val blockedUserIds = userBlockRepository.findBlockedUserIds(userId)
        val effectiveBlockedIds = if (blockedUserIds.isEmpty()) listOf(-1L) else blockedUserIds
        return walkSpotRepository.findPublicPhotoSpots(effectiveBlockedIds, pageable)
            .map { spot -> toWalkPhotoResponse(spot, suppressUrl = spot.hiddenFromPublic) }
    }

    private fun toWalkPhotoResponse(
        spot: com.goldpet.domain.walk.entity.WalkSpot,
        suppressUrl: Boolean = false
    ): WalkPhotoResponse {
        val firstPet = spot.walk.walkPets.firstOrNull()?.pet
        val rawKey = spot.imageUrl
        val resolvedUrl = if (suppressUrl) null else (photoUrlSigner.signedUrlOrNull(rawKey) ?: rawKey)
        return WalkPhotoResponse(
            id = spot.id,
            imageUrl = resolvedUrl,
            imageKey = rawKey,
            note = spot.note,
            walkDate = spot.walk.startTime,
            walkId = spot.walk.id,
            userId = spot.walk.user.id,
            petName = firstPet?.name,
            petImageUrl = firstPet?.profileImageUrl,
            hiddenFromPublic = spot.hiddenFromPublic
        )
    }

    @Transactional
    fun updateSpotVisibility(userId: Long, walkId: Long, spotId: Long, hiddenFromPublic: Boolean): WalkPhotoResponse {
        val walk = walkRepository.findById(walkId).orElseThrow { NotFoundException("Walk not found") }
        if (walk.user.id != userId) throw ForbiddenException("Not the owner of this walk")
        val spot = walkSpotRepository.findById(spotId).orElseThrow { NotFoundException("Spot not found") }
        if (spot.walk.id != walkId) throw ForbiddenException("Spot does not belong to this walk")
        spot.hiddenFromPublic = hiddenFromPublic
        return toWalkPhotoResponse(spot)
    }

    private fun parseYearMonth(yearMonth: String): Pair<java.time.LocalDateTime, java.time.LocalDateTime> {
        val parts = yearMonth.split("-")
        require(parts.size == 2) { "Invalid yearMonth format: $yearMonth" }
        val year = parts[0].toInt()
        val month = parts[1].toInt()
        val startOfMonth = java.time.LocalDateTime.of(year, month, 1, 0, 0, 0)
        return Pair(startOfMonth, startOfMonth.plusMonths(1))
    }

    private fun calculateWalkReward(distanceKm: Double): Int {
        return when {
            distanceKm < 0.5 -> 0       // 500m 미만: 보상 없음
            distanceKm < 1.0 -> 1       // 500m~1km: 1골드
            distanceKm < 3.0 -> 3       // 1km~3km: 3골드
            distanceKm < 5.0 -> 5       // 3km~5km: 5골드
            else -> 10                   // 5km 이상: 10골드
        }
    }
}
