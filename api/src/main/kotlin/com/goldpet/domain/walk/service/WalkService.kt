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
    private val userRepository: UserRepository
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
        val savedWalk = walkRepository.save(walk)
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
