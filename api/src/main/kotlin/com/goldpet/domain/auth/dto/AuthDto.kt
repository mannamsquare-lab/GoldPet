package com.goldpet.domain.auth.dto

import com.fasterxml.jackson.annotation.JsonInclude
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

    // Apple Guideline 5.1.1(v): demographic fields must be optional, not required.
    val birthDate: String?,

    val phoneNumber: String?,

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
@JsonInclude(JsonInclude.Include.NON_NULL)
data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val user: UserInfo,
    val linkSuggestion: LinkSuggestionInfo? = null
) {
    data class UserInfo(
        val id: Long,
        val username: String,
        val nickname: String,
        val email: String?,
        val phoneNumber: String? = null,
        // 가입 완료 판정용: snsSignup 완료 시에만 set, first-touch OAuth 사용자는 null.
        // nickname은 OAuth 프로필에서 채워져 신호로 못 쓰므로 name을 노출.
        val name: String? = null
    )
}

data class LinkSuggestionInfo(
    val maskedEmail: String,
    val existingProvider: String,
    val tempToken: String
)

data class ConfirmLinkRequest(
    @field:NotBlank(message = "Temp token is required")
    val tempToken: String
)

data class CheckUsernameRequest(
    @field:NotBlank(message = "Username is required")
    val username: String
)

data class CheckNicknameRequest(
    @field:NotBlank(message = "Nickname is required")
    val nickname: String
)

data class CheckEmailRequest(
    @field:NotBlank(message = "Email is required")
    @field:jakarta.validation.constraints.Email(message = "Invalid email format")
    val email: String
)

data class EmailAvailabilityResponse(
    val available: Boolean,
    val provider: String? = null
)

data class NativeLoginRequest(
    @field:NotBlank(message = "Access token is required")
    val accessToken: String
)

data class RefreshTokenRequest(
    @field:NotBlank(message = "Refresh token is required")
    val refreshToken: String
)

// Account recovery DTOs
data class FindUsernameRequest(
    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Invalid email format")
    val email: String
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class FindUsernameResponse(
    val username: String,
    val snsProvider: String? = null
)

data class VerifyAccountRequest(
    @field:NotBlank(message = "Username is required")
    val username: String,

    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Invalid email format")
    val email: String
)

data class ResetPasswordRequest(
    @field:NotBlank(message = "Username is required")
    val username: String,

    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Invalid email format")
    val email: String,

    @field:NotBlank(message = "Password is required")
    @field:Size(min = 8, max = 100)
    val password: String,

    val resetToken: String? = null
)
