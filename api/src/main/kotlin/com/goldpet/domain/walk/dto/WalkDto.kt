package com.goldpet.domain.walk.dto

import com.goldpet.domain.walk.entity.Walk
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.PositiveOrZero
import jakarta.validation.constraints.Size
import org.locationtech.jts.geom.GeometryFactory
import org.locationtech.jts.geom.PrecisionModel
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.LineString
import java.time.LocalDateTime

data class CreateWalkRequest(
    val startTime: LocalDateTime,
    val endTime: LocalDateTime,
    @field:PositiveOrZero(message = "Distance must be >= 0")
    val distanceKm: Double,
    @field:Positive(message = "Duration must be > 0")
    val durationSeconds: Long,
    @field:Size(min = 2, message = "Path must have at least 2 points")
    val path: List<List<Double>>, // List of [latitude, longitude] pairs
    val spots: List<WalkSpotDto> = emptyList(),
    val caloriesBurned: Double?,
    val notes: String?,
    val petIds: List<Long> = emptyList(),
    val isPublic: Boolean = true,
) {
    fun toLineString(): LineString {
        val geometryFactory = GeometryFactory(PrecisionModel(), 4326)
        val coords = path.map { Coordinate(it[1], it[0]) }.toTypedArray() // JTS expects (longitude, latitude)
        return geometryFactory.createLineString(coords)
    }
}

data class WalkSpotDto(
    val latitude: Double,
    val longitude: Double,
    val type: String,
    val timestamp: LocalDateTime,
    val imageUrl: String?,
    val note: String?
)

data class WalkResponse(
    val id: Long,
    val userId: Long,
    val startTime: LocalDateTime,
    val endTime: LocalDateTime,
    val distanceKm: Double,
    val durationSeconds: Long,
    val path: List<List<Double>>, // List of [latitude, longitude] pairs
    val spots: List<WalkSpotDto>,
    val caloriesBurned: Double?,
    val notes: String?,
    val startAddress: String? = null,
    val endAddress: String? = null,
    val startLatitude: Double? = null,
    val startLongitude: Double? = null,
    val endLatitude: Double? = null,
    val endLongitude: Double? = null,
    val petNames: List<String> = emptyList(),
    val petIds: List<Long> = emptyList(),
    val petProfileImageUrls: List<String?> = emptyList(),
    val isPublic: Boolean = true,
    val userNickname: String? = null,
    val userProfileImageUrl: String? = null,
) {
    companion object {
        fun from(walk: Walk): WalkResponse {
            val pathCoordinates = walk.path.coordinates.map { listOf(it.y, it.x) } // Convert back to [latitude, longitude]
            return WalkResponse(
                id = walk.id,
                userId = walk.user.id,
                startTime = walk.startTime,
                endTime = walk.endTime,
                distanceKm = walk.distanceKm,
                durationSeconds = walk.durationSeconds,
                path = pathCoordinates,
                spots = walk.spots.map { spot ->
                    WalkSpotDto(
                        latitude = spot.location.y,
                        longitude = spot.location.x,
                        type = spot.type.name,
                        timestamp = spot.timestamp,
                        imageUrl = spot.imageUrl,
                        note = spot.note
                    )
                },
                caloriesBurned = walk.caloriesBurned,
                notes = walk.notes,
                startAddress = walk.startAddress,
                endAddress = walk.endAddress,
                startLatitude = walk.startLocation?.y,
                startLongitude = walk.startLocation?.x,
                endLatitude = walk.endLocation?.y,
                endLongitude = walk.endLocation?.x,
                petNames = walk.walkPets.map { it.pet.name },
                petIds = walk.walkPets.map { it.pet.id },
                petProfileImageUrls = walk.walkPets.map { it.pet.profileImageUrl },
                isPublic = walk.isPublic,
                userNickname = walk.user.nickname,
                userProfileImageUrl = walk.user.profileImageUrl,
            )
        }

        fun publicFrom(walk: Walk): WalkResponse {
            return WalkResponse(
                id = walk.id,
                userId = walk.user.id,
                startTime = walk.startTime,
                endTime = walk.endTime,
                distanceKm = walk.distanceKm,
                durationSeconds = walk.durationSeconds,
                path = emptyList(),
                spots = emptyList(),
                caloriesBurned = walk.caloriesBurned,
                notes = null,
                startAddress = null,
                endAddress = null,
                petNames = walk.walkPets.map { it.pet.name },
                petIds = walk.walkPets.map { it.pet.id },
                petProfileImageUrls = walk.walkPets.map { it.pet.profileImageUrl },
                isPublic = walk.isPublic,
                userNickname = walk.user.nickname,
                userProfileImageUrl = walk.user.profileImageUrl,
            )
        }
    }
}

data class WalkStatsResponse(
    val totalDistanceKm: Double,
    val totalDurationMinutes: Long,
    val totalCalories: Double,
    val totalGoldEarned: Int,
    val totalWalks: Long
)
