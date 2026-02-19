package com.goldpet.domain.user.dto

data class PrivacySettingsRequest(
    val isLocationSharingEnabled: Boolean? = null,
    val isProfilePublic: Boolean? = null
)

data class PrivacySettingsResponse(
    val isLocationSharingEnabled: Boolean,
    val isProfilePublic: Boolean
)
