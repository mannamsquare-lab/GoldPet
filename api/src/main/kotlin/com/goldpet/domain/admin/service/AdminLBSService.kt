package com.goldpet.domain.admin.service

import com.goldpet.domain.admin.controller.*
import org.springframework.stereotype.Service

@Service
class AdminLBSService {
    fun getStats(): LBSStatsResponse {
        // Mock data - would come from walk and place tables
        return LBSStatsResponse(
            totalWalks = 5420,
            todayWalks = 156,
            totalDistance = 12580.5,
            avgDuration = 28,
            topSpots = listOf(
                TopSpotResponse(1, "한강공원", 1250),
                TopSpotResponse(2, "서울숲", 890),
                TopSpotResponse(3, "올림픽공원", 650)
            )
        )
    }

    fun getPlaces(): List<PlaceAdminResponse> {
        // Mock data - would come from places table
        return listOf(
            PlaceAdminResponse(1, "한강공원 반포지구", "공원", 37.5085, 126.9960, 1250, 4.8),
            PlaceAdminResponse(2, "서울숲", "공원", 37.5443, 127.0374, 890, 4.7),
            PlaceAdminResponse(3, "멍멍카페", "카페", 37.5172, 127.0473, 420, 4.5)
        )
    }

    fun createPlace(request: CreatePlaceRequest): PlaceAdminResponse {
        // Mock - would save to places table
        return PlaceAdminResponse(
            id = System.currentTimeMillis(),
            name = request.name,
            category = request.category,
            latitude = request.latitude,
            longitude = request.longitude,
            visits = 0,
            rating = 0.0
        )
    }
}
