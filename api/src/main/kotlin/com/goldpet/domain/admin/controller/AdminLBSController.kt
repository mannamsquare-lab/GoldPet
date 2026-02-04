package com.goldpet.domain.admin.controller

import com.goldpet.domain.admin.service.AdminLBSService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@Tag(name = "Admin LBS Management", description = "관리자 산책/지도 관리 API")
@RestController
@RequestMapping("/api/v1/admin/lbs")
class AdminLBSController(
    private val adminLBSService: AdminLBSService
) {
    @Operation(summary = "산책 통계 조회")
    @GetMapping("/stats")
    fun getStats(): ResponseEntity<LBSStatsResponse> {
        return ResponseEntity.ok(adminLBSService.getStats())
    }

    @Operation(summary = "장소 목록 조회")
    @GetMapping("/places")
    fun getPlaces(): ResponseEntity<List<PlaceAdminResponse>> {
        return ResponseEntity.ok(adminLBSService.getPlaces())
    }

    @Operation(summary = "장소 추가")
    @PostMapping("/places")
    fun createPlace(@RequestBody request: CreatePlaceRequest): ResponseEntity<PlaceAdminResponse> {
        return ResponseEntity.ok(adminLBSService.createPlace(request))
    }
}

data class LBSStatsResponse(
    val totalWalks: Long,
    val todayWalks: Long,
    val totalDistance: Double,
    val avgDuration: Int,
    val topSpots: List<TopSpotResponse>
)

data class TopSpotResponse(
    val id: Long,
    val name: String,
    val visits: Int
)

data class PlaceAdminResponse(
    val id: Long,
    val name: String,
    val category: String,
    val latitude: Double,
    val longitude: Double,
    val visits: Int,
    val rating: Double
)

data class CreatePlaceRequest(
    val name: String,
    val category: String,
    val latitude: Double,
    val longitude: Double
)
