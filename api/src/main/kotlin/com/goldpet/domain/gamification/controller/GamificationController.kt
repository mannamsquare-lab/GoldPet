package com.goldpet.domain.gamification.controller

import com.goldpet.domain.gamification.dto.BadgeResponse
import com.goldpet.domain.gamification.service.GamificationService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/gamification")
class GamificationController(
    private val gamificationService: GamificationService
) {

    @GetMapping("/badges")
    fun getAllBadges(
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<List<BadgeResponse>> {
        val badges = gamificationService.getAllBadgesWithStatus(userDetails.id)
        return ResponseEntity.ok(badges)
    }

    @GetMapping("/badges/my")
    fun getMyBadges(
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<List<BadgeResponse>> {
        val badges = gamificationService.getMyBadges(userDetails.id)
        return ResponseEntity.ok(badges)
    }
}
