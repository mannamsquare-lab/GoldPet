package com.goldpet.domain.admin.controller

import com.goldpet.domain.admin.service.AdminGamificationService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@Tag(name = "Admin Gamification Management", description = "관리자 게이미피케이션 관리 API")
@RestController
@RequestMapping("/v1/admin/gamification")
class AdminGamificationController(
    private val adminGamificationService: AdminGamificationService
) {
    @Operation(summary = "뱃지 목록 조회")
    @GetMapping("/badges")
    fun getBadges(): ResponseEntity<List<BadgeAdminResponse>> {
        return ResponseEntity.ok(adminGamificationService.getBadges())
    }

    @Operation(summary = "뱃지 생성")
    @PostMapping("/badges")
    fun createBadge(@RequestBody request: CreateBadgeRequest): ResponseEntity<BadgeAdminResponse> {
        return ResponseEntity.ok(adminGamificationService.createBadge(request))
    }

    @Operation(summary = "챌린지 목록 조회")
    @GetMapping("/challenges")
    fun getChallenges(): ResponseEntity<List<ChallengeAdminResponse>> {
        return ResponseEntity.ok(adminGamificationService.getChallenges())
    }

    @Operation(summary = "챌린지 생성")
    @PostMapping("/challenges")
    fun createChallenge(@RequestBody request: CreateChallengeRequest): ResponseEntity<ChallengeAdminResponse> {
        return ResponseEntity.ok(adminGamificationService.createChallenge(request))
    }
}

data class BadgeAdminResponse(
    val id: Long,
    val code: String,
    val name: String,
    val description: String,
    val imageUrl: String?,
    val earnedCount: Int
)

data class CreateBadgeRequest(
    val code: String,
    val name: String,
    val description: String,
    val imageUrl: String?
)

data class ChallengeAdminResponse(
    val id: Long,
    val title: String,
    val description: String,
    val goalType: String,
    val goalValue: Int,
    val startDate: String,
    val endDate: String,
    val participantCount: Int,
    val completedCount: Int
)

data class CreateChallengeRequest(
    val title: String,
    val description: String,
    val goalType: String,
    val goalValue: Int,
    val startDate: String,
    val endDate: String
)
