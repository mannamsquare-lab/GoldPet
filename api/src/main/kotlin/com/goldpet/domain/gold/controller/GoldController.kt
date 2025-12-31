package com.goldpet.domain.gold.controller

import com.goldpet.config.security.UserPrincipal
import com.goldpet.domain.gold.dto.*
import com.goldpet.domain.gold.service.GoldService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@Tag(name = "Gold", description = "골드/결제 API")
@RestController
@RequestMapping("/v1/gold")
class GoldController(
    private val goldService: GoldService
) {
    @Operation(summary = "내 골드 잔액")
    @GetMapping("/balance")
    fun getBalance(@AuthenticationPrincipal principal: UserPrincipal): ResponseEntity<GoldBalanceResponse> {
        return ResponseEntity.ok(goldService.getBalance(principal.id))
    }

    @Operation(summary = "골드 상품 목록")
    @GetMapping("/products")
    fun getProducts(): ResponseEntity<List<GoldProductResponse>> {
        return ResponseEntity.ok(goldService.getProducts())
    }

    @Operation(summary = "거래 내역")
    @GetMapping("/transactions")
    fun getTransactions(
        @AuthenticationPrincipal principal: UserPrincipal,
        @PageableDefault(size = 20) pageable: Pageable
    ): ResponseEntity<Page<TransactionResponse>> {
        return ResponseEntity.ok(goldService.getTransactions(principal.id, pageable))
    }

    @Operation(summary = "골드 충전", description = "IAP 후 골드 지급 처리")
    @PostMapping("/charge")
    fun chargeGold(
        @AuthenticationPrincipal principal: UserPrincipal,
        @RequestBody request: ChargeRequest
    ): ResponseEntity<TransactionResponse> {
        return ResponseEntity.ok(goldService.chargeGold(principal.id, request))
    }

    @Operation(summary = "골드 사용")
    @PostMapping("/spend")
    fun spendGold(
        @AuthenticationPrincipal principal: UserPrincipal,
        @RequestBody request: SpendRequest
    ): ResponseEntity<TransactionResponse> {
        return ResponseEntity.ok(goldService.spendGold(principal.id, request))
    }
}
