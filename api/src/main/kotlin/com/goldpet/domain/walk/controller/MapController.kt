package com.goldpet.domain.walk.controller

import com.goldpet.config.security.UserPrincipal
import com.goldpet.domain.walk.repository.WalkRepository
import com.goldpet.infra.GeocodingService
import com.goldpet.infra.StaticMapService
import org.springframework.http.CacheControl
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.concurrent.TimeUnit

@RestController
@RequestMapping("/api/v1/maps")
class MapController(
    private val geocodingService: GeocodingService,
    private val staticMapService: StaticMapService,
    private val walkRepository: WalkRepository
) {
    @GetMapping("/reverse-geocode")
    fun reverseGeocode(
        @RequestParam lat: Double,
        @RequestParam lng: Double
    ): ResponseEntity<Map<String, String?>> {
        val result = geocodingService.reverseGeocodeStructured(lat, lng)
        return ResponseEntity.ok(mapOf("address" to result.fullAddress, "province" to result.province))
    }

    @GetMapping("/geocode")
    fun geocode(
        @RequestParam address: String
    ): ResponseEntity<Map<String, List<GeocodingService.GeocodeResult>>> {
        val results = geocodingService.geocode(address)
        return ResponseEntity.ok(mapOf("results" to results))
    }

    @GetMapping("/static/{walkId}")
    fun getStaticMap(
        @AuthenticationPrincipal userDetails: UserPrincipal?,
        @PathVariable walkId: Long,
        @RequestParam(defaultValue = "120") w: Int,
        @RequestParam(defaultValue = "120") h: Int
    ): ResponseEntity<ByteArray> {
        if (userDetails == null) {
            return ResponseEntity.status(401).build()
        }

        val walk = walkRepository.findById(walkId).orElse(null)
            ?: return ResponseEntity.notFound().build()

        // Allow public walk maps for any authenticated user; private walks owner-only
        if (walk.user.id != userDetails.id && !walk.isPublic) {
            return ResponseEntity.status(403).build()
        }

        val coordinates = walk.path.coordinates
        if (coordinates.size < 2) {
            return ResponseEntity.noContent().build()
        }

        // Clamp dimensions to reasonable range
        val width = w.coerceIn(60, 600)
        val height = h.coerceIn(60, 600)

        val imageBytes = staticMapService.getStaticMapImage(coordinates, width, height)
            ?: return ResponseEntity.status(502).build()

        return ResponseEntity.ok()
            .contentType(MediaType.IMAGE_PNG)
            .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePrivate())
            .body(imageBytes)
    }
}
