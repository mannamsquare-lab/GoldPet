package com.goldpet.domain.auth.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

// Request DTO for traditional signup
data class SignupRequest(
    @field:NotBlank(message = "Username is required")
    @field:Size(min = 4, max = 20)
    val username: String,

    @field:NotBlank(message = "Password is required")
    @field:Size(min = 8, max = 100)
    val password: String,

    @field:NotBlank(message = "Nickname is required")
    val nickname: String,

    @field:NotBlank(message = "Name is required")
    val name: String,

    @field:NotBlank(message = "Birthdate is required")
    val birthDate: String,

    @field:NotBlank(message = "Phone number is required")
    val phoneNumber: String,

    @field:Email(message = "Invalid email format")
    val email: String?,

    val gender: String?,
    val birthYear: Int?,
    val mainLocationText: String?
)

// Request DTO for login (username/password)
data class LoginRequest(
    @field:NotBlank(message = "Username is required")
    val username: String,

    @field:NotBlank(message = "Password is required")
    val password: String
)

// Response DTO after successful authentication
data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val user: UserInfo
) {
    data class UserInfo(
        val id: Long,
        val username: String,
        val nickname: String,
        val email: String?
    )
}
