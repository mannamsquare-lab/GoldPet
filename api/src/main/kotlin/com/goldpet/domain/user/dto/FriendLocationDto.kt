package com.goldpet.domain.user.dto

import com.goldpet.domain.user.entity.User

data class FriendLocationResponse(
    val id: Long,
    val nickname: String?,
    val profileImageUrl: String?,
    val latitude: Double?,
    val longitude: Double?
) {
    companion object {
        fun from(user: User): FriendLocationResponse {
            return FriendLocationResponse(
                id = user.id,
                nickname = user.nickname,
                profileImageUrl = user.profileImageUrl,
                latitude = user.mainLocationGeom?.y,
                longitude = user.mainLocationGeom?.x
            )
        }
    }
}
