package com.goldpet.domain.admin.service

import com.goldpet.domain.admin.controller.*
import com.goldpet.domain.checkin.entity.Place
import com.goldpet.domain.checkin.entity.PlaceCategory
import com.goldpet.domain.checkin.repository.CheckInRepository
import com.goldpet.domain.checkin.repository.PlaceRepository
import com.goldpet.domain.walk.repository.WalkRepository
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.locationtech.jts.geom.PrecisionModel
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import kotlin.math.roundToInt

@Service
class AdminLBSService(
    private val walkRepository: WalkRepository,
    private val placeRepository: PlaceRepository,
    private val checkInRepository: CheckInRepository
) {
    fun getStats(): LBSStatsResponse {
        val today = LocalDate.now().atStartOfDay()

        return LBSStatsResponse(
            totalWalks = walkRepository.count(),
            todayWalks = walkRepository.countByStartTimeAfter(today),
            totalDistance = walkRepository.sumTotalDistanceKm(),
            avgDuration = (walkRepository.avgDurationSeconds() / 60.0).roundToInt(),
            topSpots = checkInRepository.findTopPlaces(5).map { row ->
                TopSpotResponse(
                    id = (row[0] as Number).toLong(),
                    name = row[1] as String,
                    visits = (row[2] as Number).toInt()
                )
            }
        )
    }

    fun getPlaces(): List<PlaceAdminResponse> {
        return placeRepository.findAll().map { place ->
            PlaceAdminResponse(
                id = place.id,
                name = place.name,
                category = place.category.name,
                latitude = place.locationGeom.y,
                longitude = place.locationGeom.x,
                visits = place.checkinCount,
                rating = 0.0 // 리뷰 시스템 미구현
            )
        }
    }

    @Transactional
    fun createPlace(request: CreatePlaceRequest): PlaceAdminResponse {
        val geometryFactory = GeometryFactory(PrecisionModel(), 4326)
        val point = geometryFactory.createPoint(Coordinate(request.longitude, request.latitude))
        val place = placeRepository.save(Place(
            name = request.name,
            category = PlaceCategory.valueOf(request.category.uppercase()),
            locationGeom = point
        ))
        return PlaceAdminResponse(
            id = place.id,
            name = place.name,
            category = place.category.name,
            latitude = place.locationGeom.y,
            longitude = place.locationGeom.x,
            visits = place.checkinCount,
            rating = 0.0
        )
    }
}
