package com.goldpet.domain.user.dto

import com.goldpet.domain.user.entity.User
import org.locationtech.jts.geom.Point

data class UserResponse(
    val id: Long,
    val email: String?,
    val nickname: String?,
    val gender: String?,
    val birthYear: Int?,
    val mainLocationText: String?,
    val mainLocationLat: Double?,
    val mainLocationLng: Double?,
    val profileImageUrl: String?,
    val goldBalance: Int,
    val isActive: Boolean
) {
    companion object {
        fun from(user: User): UserResponse {
            return UserResponse(
                id = user.id,
                email = user.email,
                nickname = user.nickname,
                gender = user.gender,
                birthYear = user.birthYear,
                mainLocationText = user.mainLocationText,
                mainLocationLat = user.mainLocationGeom?.y, // Latitude
                mainLocationLng = user.mainLocationGeom?.x, // Longitude
                profileImageUrl = user.profileImageUrl,
                goldBalance = user.goldBalance,
                isActive = user.isActive
            )
        }
    }
}
