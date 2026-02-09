package com.goldpet.domain.walk.controller

import com.goldpet.domain.walk.dto.CreateWalkRequest
import com.goldpet.domain.walk.dto.WalkResponse
import com.goldpet.domain.walk.dto.BoundingBoxRequest
import com.goldpet.domain.walk.dto.WalkRankingResponse
import com.goldpet.domain.walk.service.WalkService
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
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal,
        @RequestBody request: CreateWalkRequest
    ): ResponseEntity<WalkResponse> {
        val walkResponse = walkService.createWalk(userDetails.id, request)
        return ResponseEntity.created(URI.create("/api/v1/walks/${walkResponse.id}")).body(walkResponse)
    }

    @GetMapping("/{walkId}")
    fun getWalk(@PathVariable walkId: Long): ResponseEntity<WalkResponse> {
        val walkResponse = walkService.getWalk(walkId)
        return ResponseEntity.ok(walkResponse)
    }

    @GetMapping("/my")
    fun getMyWalks(
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<List<WalkResponse>> {
        val walkResponses = walkService.getWalksByUser(userDetails.id)
        return ResponseEntity.ok(walkResponses)
    }

    @GetMapping("/search")
    fun searchWalksInArea(
        @RequestParam minLat: Double,
        @RequestParam minLon: Double,
        @RequestParam maxLat: Double,
        @RequestParam maxLon: Double
    ): ResponseEntity<List<WalkResponse>> {
        val request = BoundingBoxRequest(minLat, minLon, maxLat, maxLon)
        val walkResponses = walkService.findWalksInArea(request)
        return ResponseEntity.ok(walkResponses)
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
