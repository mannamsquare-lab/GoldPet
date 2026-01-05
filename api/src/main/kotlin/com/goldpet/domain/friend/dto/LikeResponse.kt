package com.goldpet.domain.friend.dto

data class LikeResponse(
    val likeId: Long,
    val toUserId: Long,
    val isMutual: Boolean
)
