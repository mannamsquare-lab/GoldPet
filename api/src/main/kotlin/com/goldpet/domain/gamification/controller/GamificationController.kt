package com.goldpet.domain.gamification.controller

import com.goldpet.domain.gamification.dto.BadgeResponse
import com.goldpet.domain.gamification.dto.ChallengeResponse
import com.goldpet.domain.gamification.dto.UserChallengeProgressResponse
import com.goldpet.domain.gamification.service.GamificationService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Tag(name = "Gamification", description = "Gamification API (Badges & Challenges)")
@RestController
@RequestMapping("/api/v1/gamification")
class GamificationController(
    private val gamificationService: GamificationService
) {

    private fun getUserId(userDetails: UserDetails): Long {
        return userDetails.username.toLong()
    }

    @Operation(summary = "List All Badges")
    @GetMapping("/badges")
    fun getAllBadges(): ResponseEntity<List<BadgeResponse>> {
        return ResponseEntity.ok(gamificationService.getAllBadges())
    }

    @Operation(summary = "My Badges")
    @GetMapping("/my-badges")
    fun getMyBadges(@AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<List<BadgeResponse>> {
        val userId = getUserId(userDetails)
        return ResponseEntity.ok(gamificationService.getMyBadges(userId))
    }

    @Operation(summary = "List Active Challenges")
    @GetMapping("/challenges")
    fun getActiveChallenges(): ResponseEntity<List<ChallengeResponse>> {
        return ResponseEntity.ok(gamificationService.getActiveChallenges())
    }

    @Operation(summary = "My Challenge Progress")
    @GetMapping("/my-challenges")
    fun getMyChallengeProgress(@AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<List<UserChallengeProgressResponse>> {
        val userId = getUserId(userDetails)
        return ResponseEntity.ok(gamificationService.getMyChallengeProgress(userId))
    }
}
