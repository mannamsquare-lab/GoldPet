package com.goldpet.domain.walk.dto

import com.goldpet.domain.walk.entity.Walk
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.PositiveOrZero
import jakarta.validation.constraints.Size
import org.locationtech.jts.geom.GeometryFactory
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
) {
    fun toLineString(): LineString {
        val geometryFactory = GeometryFactory()
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
                notes = walk.notes
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
                path = emptyList(), // Hide detailed route for non-owner views
                spots = emptyList(), // Hide spots for non-owner views
                caloriesBurned = walk.caloriesBurned,
                notes = null // Hide notes for non-owner views
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
