package com.goldpet.domain.walk.dto

import com.goldpet.domain.walk.entity.Walk
import org.locationtech.jts.geom.GeometryFactory
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.LineString
import java.time.LocalDateTime

data class CreateWalkRequest(
    val startTime: LocalDateTime,
    val endTime: LocalDateTime,
    val distanceKm: Double,
    val durationSeconds: Long,
    val path: List<List<Double>>, // List of [latitude, longitude] pairs
    val spots: List<WalkSpotDto> = emptyList(),
    val caloriesBurned: Double?,
    val notes: String?,
) {
    fun toLineString(): LineString {
        val geometryFactory = GeometryFactory()
        val coords = path.map { Coordinate(it[1], it[0]) } // JTS expects (longitude, latitude)
        // LineString requires at least 2 points
        val coordinates = when {
            coords.size >= 2 -> coords.toTypedArray()
            coords.size == 1 -> arrayOf(coords[0], Coordinate(coords[0]))
            else -> arrayOf(Coordinate(0.0, 0.0), Coordinate(0.0, 0.0))
        }
        return geometryFactory.createLineString(coordinates)
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
    }
}

data class WalkStatsResponse(
    val totalDistanceKm: Double,
    val totalDurationMinutes: Long,
    val totalCalories: Double,
    val totalGoldEarned: Int,
    val totalWalks: Long
)
