package com.goldpet.domain.home.dto

import com.goldpet.domain.friend.dto.FriendResponse
import java.time.LocalDateTime

data class HomeResponse(
    val recommendations: List<FriendResponse>,
    val recentWalk: HomeRecentWalkResponse?,
    val notifications: NotificationSummary,
    val myPetNames: List<String> = emptyList()
)

data class NotificationSummary(
    val hasUnread: Boolean,
    val count: Long
)

data class HomeRecentWalkResponse(
    val id: Long,
    val distanceKm: Double,
    val durationSeconds: Long,
    val endTime: LocalDateTime,
    val startAddress: String?,
    val petNames: List<String>,
    val petProfileImageUrls: List<String>,
)
