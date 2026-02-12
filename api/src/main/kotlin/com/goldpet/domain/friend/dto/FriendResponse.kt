package com.goldpet.domain.friend.dto

data class FriendResponse(
    val id: Long,
    val nickname: String,
    val profileImageUrl: String?,
    val petName: String,
    val petBreed: String,
    val petAge: Int,
    val petGender: String, // "MALE" | "FEMALE"
    val isNeutered: Boolean,
    val onWalking: Boolean,
    val description: String,
    val tags: List<String>,
    val images: List<String>,
    val distance: Double, // in meters
    val status: String, // "online", "offline", "walking"
    val location: LocationDto?,
    val locationText: String?
)

data class LocationDto(
    val lat: Double,
    val lng: Double
)
