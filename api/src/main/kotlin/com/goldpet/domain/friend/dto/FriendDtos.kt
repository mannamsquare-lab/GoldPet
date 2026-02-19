package com.goldpet.domain.friend.dto

data class LikeRequest(
    val toUserId: Long
)

data class MatchResponse(
    val matchId: Long,
    val partnerId: Long,
    val partnerNickname: String?,
    val partnerProfileImage: String?,
    val matchedAt: String?
)

data class BlockRequest(
    val blockedUserId: Long
)

data class BlockedUserResponse(
    val blockId: Long,
    val blockedUserId: Long,
    val blockedNickname: String?,
    val blockedProfileImageUrl: String?,
    val blockedPetName: String?,
    val blockedAt: String?
)
