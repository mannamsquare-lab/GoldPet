package com.goldpet.domain.admin.controller

import com.goldpet.domain.admin.service.AdminGamificationService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@Tag(name = "Admin Gamification Management", description = "관리자 게이미피케이션 관리 API")
@RestController
@RequestMapping("/api/v1/admin/gamification")
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

    @Operation(summary = "뱃지 수정")
    @PutMapping("/badges/{badgeId}")
    fun updateBadge(
        @PathVariable badgeId: Long,
        @RequestBody request: UpdateBadgeRequest
    ): ResponseEntity<BadgeAdminResponse> {
        return ResponseEntity.ok(adminGamificationService.updateBadge(badgeId, request))
    }
}

data class BadgeAdminResponse(
    val id: Long,
    val name: String,
    val description: String,
    val imageUrl: String?,
    val conditionType: String?,
    val conditionValue: Int?,
    val isActive: Boolean,
    val rewardGold: Int?,
    val startDate: String?,
    val endDate: String?,
    val isRepeatable: Boolean,
    val repeatCycle: String?,
    val earnedCount: Int
)

data class CreateBadgeRequest(
    val name: String,
    val description: String,
    val imageUrl: String?,
    val conditionType: String?,
    val conditionValue: Int?,
    val rewardGold: Int?,
    val startDate: String?,
    val endDate: String?,
    val isRepeatable: Boolean?,
    val repeatCycle: String?
)

data class UpdateBadgeRequest(
    val name: String?,
    val description: String?,
    val imageUrl: String?,
    val conditionType: String?,
    val conditionValue: Int?,
    val isActive: Boolean?,
    val rewardGold: Int?,
    val startDate: String?,
    val endDate: String?,
    val isRepeatable: Boolean?,
    val repeatCycle: String?
)
