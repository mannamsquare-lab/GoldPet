package com.goldpet.domain.walk.dto

data class BoundingBoxRequest(
    val minLat: Double,
    val minLon: Double,
    val maxLat: Double,
    val maxLon: Double
)
