package com.goldpet.domain.user.dto

data class UserProfileUpdateRequest(
    val nickname: String?,
    val gender: String?,
    val birthYear: Int?,
    val mainLocationText: String?
)
