package com.goldpet.domain.user.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class UserProfileUpdateRequest(
    val name: String?,
    val nickname: String?,
    val birthDate: String?,
    val phoneNumber: String?,
    val gender: String?,
    @field:JsonProperty("hasPet")
    val hasPet: Boolean?,
    val intro: String?,
    val mbti: String?,
    val interests: List<String> = emptyList(),
    val hobbies: List<String> = emptyList()
)
