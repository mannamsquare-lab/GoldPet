package com.goldpet.domain.admin.controller

import com.goldpet.domain.admin.service.AdminEconomyService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@Tag(name = "Admin Economy Management", description = "관리자 Gold/결제 관리 API")
@RestController
@RequestMapping("/api/v1/admin/economy")
class AdminEconomyController(
    private val adminEconomyService: AdminEconomyService
) {
    @Operation(summary = "경제 통계 조회")
    @GetMapping("/stats")
    fun getStats(): ResponseEntity<EconomyStatsResponse> {
        return ResponseEntity.ok(adminEconomyService.getStats())
    }

    @Operation(summary = "거래 내역 조회")
    @GetMapping("/transactions")
    fun getTransactions(
        @RequestParam(required = false) type: String?,
        pageable: Pageable
    ): ResponseEntity<Page<TransactionAdminResponse>> {
        return ResponseEntity.ok(adminEconomyService.getTransactions(type, pageable))
    }

    @Operation(summary = "Gold 조정")
    @PostMapping("/adjust")
    fun adjustGold(@RequestBody request: GoldAdjustRequest): ResponseEntity<Void> {
        adminEconomyService.adjustGold(request)
        return ResponseEntity.ok().build()
    }
}

data class EconomyStatsResponse(
    val totalGoldCirculation: Long,
    val totalRevenue: Long,
    val todayRevenue: Long,
    val activeSubscriptions: Int,
    val pendingPayouts: Int
)

data class TransactionAdminResponse(
    val id: Long,
    val userId: Long,
    val userNickname: String,
    val type: String,
    val amount: Int,
    val description: String,
    val createdAt: String?
)

data class GoldAdjustRequest(
    val userId: Long,
    val amount: Int,
    val reason: String
)
