package com.goldpet.domain.walk.controller

import com.goldpet.domain.walk.dto.CreateWalkRequest
import com.goldpet.domain.walk.dto.WalkResponse
import com.goldpet.domain.walk.dto.BoundingBoxRequest
import com.goldpet.domain.walk.service.WalkService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.net.URI

@RestController
@RequestMapping("/api/v1/walks")
class WalkController(
    private val walkService: WalkService
) {

    // TODO: Replace with actual authenticated user ID
    private val currentUserId: Long = 1

    @PostMapping
    fun createWalk(@RequestBody request: CreateWalkRequest): ResponseEntity<WalkResponse> {
        val walkResponse = walkService.createWalk(currentUserId, request)
        return ResponseEntity.created(URI.create("/api/v1/walks/${walkResponse.id}")).body(walkResponse)
    }

    @GetMapping("/{walkId}")
    fun getWalk(@PathVariable walkId: Long): ResponseEntity<WalkResponse> {
        val walkResponse = walkService.getWalk(walkId)
        return ResponseEntity.ok(walkResponse)
    }

    @GetMapping("/my")
    fun getMyWalks(): ResponseEntity<List<WalkResponse>> {
        val walkResponses = walkService.getWalksByUser(currentUserId)
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
}
