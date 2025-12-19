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
    val caloriesBurned: Double?,
    val notes: String?,
) {
    fun toLineString(): LineString {
        val geometryFactory = GeometryFactory()
        val coordinates = path.map { Coordinate(it[1], it[0]) }.toTypedArray() // JTS expects (longitude, latitude)
        return geometryFactory.createLineString(coordinates)
    }
}

data class WalkResponse(
    val id: Long,
    val userId: Long,
    val startTime: LocalDateTime,
    val endTime: LocalDateTime,
    val distanceKm: Double,
    val durationSeconds: Long,
    val path: List<List<Double>>, // List of [latitude, longitude] pairs
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
                caloriesBurned = walk.caloriesBurned,
                notes = walk.notes
            )
        }
    }
}
