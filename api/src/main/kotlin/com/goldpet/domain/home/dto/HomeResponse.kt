package com.goldpet.domain.home.dto

import com.goldpet.domain.friend.dto.FriendResponse
import com.goldpet.domain.walk.dto.WalkResponse

data class HomeResponse(
    val recommendations: List<FriendResponse>,
    val recentWalk: WalkResponse?,
    val notifications: NotificationSummary
)

data class NotificationSummary(
    val hasUnread: Boolean,
    val count: Long
)
