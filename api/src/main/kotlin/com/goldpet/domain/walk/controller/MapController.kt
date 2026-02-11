package com.goldpet.domain.walk.controller

import com.goldpet.domain.walk.service.NaverGeocodingService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/maps")
class MapController(
    private val naverGeocodingService: NaverGeocodingService
) {
    @GetMapping("/reverse-geocode")
    fun reverseGeocode(
        @RequestParam lat: Double,
        @RequestParam lng: Double
    ): ResponseEntity<Map<String, String>> {
        val address = naverGeocodingService.reverseGeocode(lat, lng)
        return ResponseEntity.ok(mapOf("address" to address))
    }
}
