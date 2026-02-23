package com.goldpet.domain.friend.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class FriendResponse(
    val id: Long,
    val nickname: String,
    val profileImageUrl: String?,
    val profileImages: List<String>,  // Owner's all profile images (multiple)
    val ownerGender: String?,         // "MALE" | "FEMALE"
    val ownerAge: Int?,               // calculated from birthDate
    val ownerIntro: String?,          // self introduction
    val ownerMbti: String?,           // MBTI
    val ownerInterests: List<String>, // interests names
    val ownerHobbies: List<String>,   // hobbies names
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
