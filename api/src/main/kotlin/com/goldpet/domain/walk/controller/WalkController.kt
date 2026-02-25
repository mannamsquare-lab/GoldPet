package com.goldpet.domain.walk.controller

import com.goldpet.domain.walk.dto.CreateWalkRequest
import com.goldpet.domain.walk.dto.WalkResponse
import com.goldpet.domain.walk.dto.BoundingBoxRequest
import com.goldpet.domain.walk.dto.WalkRankingResponse
import com.goldpet.domain.walk.dto.WalkStatsResponse
import com.goldpet.domain.walk.service.WalkService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.net.URI

@RestController
@RequestMapping("/api/v1/walks")
class WalkController(
    private val walkService: WalkService
) {

    @PostMapping
    fun createWalk(
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal?,
        @RequestBody @Valid request: CreateWalkRequest
    ): ResponseEntity<WalkResponse> {
        if (userDetails == null) return ResponseEntity.status(401).build()
        val walkResponse = walkService.createWalk(userDetails.id, request)
        return ResponseEntity.created(URI.create("/api/v1/walks/${walkResponse.id}")).body(walkResponse)
    }

    @GetMapping("/{walkId}")
    fun getWalk(@PathVariable walkId: Long): ResponseEntity<WalkResponse> {
        val walkResponse = walkService.getWalk(walkId)
        return ResponseEntity.ok(walkResponse)
    }

    @GetMapping("/my/stats")
    fun getMyStats(
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal?
    ): ResponseEntity<WalkStatsResponse> {
        if (userDetails == null) return ResponseEntity.status(401).build()
        val stats = walkService.getMyStats(userDetails.id)
        return ResponseEntity.ok(stats)
    }

    @GetMapping("/my")
    fun getMyWalks(
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal?
    ): ResponseEntity<List<WalkResponse>> {
        if (userDetails == null) return ResponseEntity.status(401).build()
        val walkResponses = walkService.getWalksByUser(userDetails.id)
        return ResponseEntity.ok(walkResponses)
    }

    @GetMapping("/search")
    fun searchWalksInArea(
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal?,
        @ModelAttribute @Valid request: BoundingBoxRequest
    ): ResponseEntity<List<WalkResponse>> {
        val walkResponses = walkService.findWalksInArea(request)
        // Return public (route-stripped) view; owner detail available via GET /walks/{id}
        val currentUserId = userDetails?.id
        return ResponseEntity.ok(walkResponses.map { response ->
            if (currentUserId != null && response.userId == currentUserId) response
            else WalkResponse(
                id = response.id,
                userId = response.userId,
                startTime = response.startTime,
                endTime = response.endTime,
                distanceKm = response.distanceKm,
                durationSeconds = response.durationSeconds,
                path = emptyList(),
                spots = emptyList(),
                caloriesBurned = response.caloriesBurned,
                notes = null
            )
        })
    }

    @GetMapping("/ranking")
    fun getWalkRanking(
        @RequestParam(defaultValue = "weekly") period: String,
        @org.springframework.data.web.PageableDefault(size = 50) pageable: org.springframework.data.domain.Pageable
    ): ResponseEntity<List<WalkRankingResponse>> {
        val rankings = walkService.getWalkRanking(period, pageable)
        return ResponseEntity.ok(rankings)
    }
}
