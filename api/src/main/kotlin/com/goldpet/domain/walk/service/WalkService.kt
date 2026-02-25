package com.goldpet.domain.walk.service

import com.goldpet.domain.gamification.entity.BadgeConditionType
import com.goldpet.domain.gamification.service.BadgeAwardService
import com.goldpet.domain.common.exception.*
import com.goldpet.domain.gold.service.GoldService
import com.goldpet.domain.user.repository.UserRepository
import com.goldpet.domain.walk.dto.CreateWalkRequest
import com.goldpet.domain.walk.dto.WalkResponse
import com.goldpet.domain.walk.dto.BoundingBoxRequest
import com.goldpet.domain.walk.dto.WalkRankingResponse
import com.goldpet.domain.walk.entity.Walk
import com.goldpet.domain.walk.repository.WalkRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class WalkService(
    private val walkRepository: WalkRepository,
    private val userRepository: UserRepository,
    private val goldService: GoldService,
    private val badgeAwardService: BadgeAwardService
) {
    private val log = LoggerFactory.getLogger(WalkService::class.java)

    @Transactional
    fun createWalk(userId: Long, request: CreateWalkRequest): WalkResponse {
        val user = userRepository.findById(userId).orElseThrow { NotFoundException("User not found") }

        val walk = Walk(
            user = user,
            startTime = request.startTime,
            endTime = request.endTime,
            distanceKm = request.distanceKm,
            durationSeconds = request.durationSeconds,
            path = request.toLineString(),
            caloriesBurned = request.caloriesBurned,
            notes = request.notes
        )
        
        // Add spots
        val geometryFactory = org.locationtech.jts.geom.GeometryFactory()
        request.spots.forEach { spotDto ->
            val point = geometryFactory.createPoint(org.locationtech.jts.geom.Coordinate(spotDto.longitude, spotDto.latitude))
            walk.spots.add(com.goldpet.domain.walk.entity.WalkSpot(
                walk = walk,
                location = point,
                type = com.goldpet.domain.walk.entity.WalkSpotType.valueOf(spotDto.type),
                timestamp = spotDto.timestamp,
                imageUrl = spotDto.imageUrl,
                note = spotDto.note
            ))
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

        return WalkResponse.from(savedWalk)
    }

    fun getWalk(walkId: Long): WalkResponse {
        val walk = walkRepository.findById(walkId).orElseThrow { NotFoundException("Walk not found") }
        return WalkResponse.from(walk)
    }

    fun getWalksByUser(userId: Long): List<WalkResponse> {
        val walks = walkRepository.findByUserId(userId)
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

    fun getWalkRanking(period: String, pageable: org.springframework.data.domain.Pageable): List<WalkRankingResponse> {
        val since = when (period) {
            "monthly" -> java.time.LocalDateTime.now().minusDays(30)
            else -> java.time.LocalDateTime.now().minusDays(7) // weekly default
        }

        val results = walkRepository.findRankingsSince(since, pageable)
        return results.mapIndexed { index, row ->
            WalkRankingResponse(
                rank = index + 1,
                userId = (row[0] as Number).toLong(),
                nickname = row[1] as String,
                profileImageUrl = row[2] as? String,
                totalDistanceKm = (row[3] as Number).toDouble(),
                walkCount = (row[4] as Number).toInt()
            )
        }
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
