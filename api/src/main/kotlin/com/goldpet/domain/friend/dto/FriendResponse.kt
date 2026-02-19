package com.goldpet.domain.friend.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class FriendResponse(
    val id: Long,
    val nickname: String,
    val profileImageUrl: String?,
    val petName: String,
    val petBreed: String,
    val petAge: Int,
    val petGender: String, // "MALE" | "FEMALE"
    @get:JsonProperty("isNeutered")
    val isNeutered: Boolean,
    val onWalking: Boolean,
    val description: String,
    val tags: List<String>,
    val images: List<String>,
    val distance: Double, // in meters
    val status: String, // "online", "offline", "walking"
    @Deprecated("Location coordinates removed for privacy. Use locationText and distance instead.")
    val location: LocationDto?,
    val locationText: String?
)

data class LocationDto(
    val lat: Double,
    val lng: Double
)
