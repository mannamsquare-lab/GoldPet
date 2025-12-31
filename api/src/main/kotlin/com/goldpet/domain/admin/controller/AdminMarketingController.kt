package com.goldpet.domain.admin.controller

import com.goldpet.domain.admin.service.AdminMarketingService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@Tag(name = "Admin Marketing", description = "관리자 마케팅 관리 API")
@RestController
@RequestMapping("/v1/admin/marketing")
class AdminMarketingController(
    private val adminMarketingService: AdminMarketingService
) {
    @Operation(summary = "배너 목록 조회")
    @GetMapping("/banners")
    fun getBanners(): ResponseEntity<List<Map<String, Any>>> {
        return ResponseEntity.ok(adminMarketingService.getBanners())
    }

    @Operation(summary = "배너 생성")
    @PostMapping("/banners")
    fun createBanner(@RequestBody request: Map<String, Any>): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(adminMarketingService.createBanner(request))
    }

    @Operation(summary = "배너 삭제")
    @DeleteMapping("/banners/{bannerId}")
    fun deleteBanner(@PathVariable bannerId: Long): ResponseEntity<Void> {
        adminMarketingService.deleteBanner(bannerId)
        return ResponseEntity.noContent().build()
    }

    @Operation(summary = "캠페인 목록 조회")
    @GetMapping("/campaigns")
    fun getCampaigns(): ResponseEntity<List<Map<String, Any>>> {
        return ResponseEntity.ok(adminMarketingService.getCampaigns())
    }

    @Operation(summary = "캠페인 생성")
    @PostMapping("/campaigns")
    fun createCampaign(@RequestBody request: Map<String, Any>): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(adminMarketingService.createCampaign(request))
    }

    @Operation(summary = "푸시 발송")
    @PostMapping("/push")
    fun sendPush(@RequestBody request: Map<String, Any>): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(adminMarketingService.sendPush(request))
    }
}
