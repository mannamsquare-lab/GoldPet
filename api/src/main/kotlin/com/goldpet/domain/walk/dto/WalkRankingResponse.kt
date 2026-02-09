package com.goldpet.domain.walk.dto

data class WalkRankingResponse(
    val rank: Int,
    val userId: Long,
    val nickname: String,
    val profileImageUrl: String?,
    val totalDistanceKm: Double,
    val walkCount: Int
)
