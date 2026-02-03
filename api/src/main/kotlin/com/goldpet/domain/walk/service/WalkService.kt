package com.goldpet.domain.walk.service

import com.goldpet.domain.user.repository.UserRepository
import com.goldpet.domain.walk.dto.CreateWalkRequest
import com.goldpet.domain.walk.dto.WalkResponse
import com.goldpet.domain.walk.dto.BoundingBoxRequest
import com.goldpet.domain.walk.entity.Walk
import com.goldpet.domain.walk.repository.WalkRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class WalkService(
    private val walkRepository: WalkRepository,
    private val userRepository: UserRepository,
    private val gamificationService: com.goldpet.domain.gamification.service.GamificationService
) {

    @Transactional
    fun createWalk(userId: Long, request: CreateWalkRequest): WalkResponse {
        val user = userRepository.findById(userId).orElseThrow { EntityNotFoundException("User not found") }

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

        // Update Gamification Challenge (Walk Distance)
        try {
            // distanceKm is double, challenge goal is usually int (e.g. meters or just km count).
            // Assuming goal value is in KM for simplicity or let's convert to Meters?
            // Existing DB schema says goal_value is INT. Let's assume it's Meters.
            val distMeters = (savedWalk.distanceKm * 1000).toInt()
            gamificationService.updateChallengeProgress(
                userId, 
                com.goldpet.domain.gamification.entity.Challenge.GoalType.WALK_DISTANCE_TOTAL, 
                distMeters
            )
        } catch (e: Exception) {
            // Log error but don't fail the walk creation
            println("Failed to update gamification progress: ${e.message}")
        }

        return WalkResponse.from(savedWalk)
    }

    fun getWalk(walkId: Long): WalkResponse {
        val walk = walkRepository.findById(walkId).orElseThrow { EntityNotFoundException("Walk not found") }
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
}
