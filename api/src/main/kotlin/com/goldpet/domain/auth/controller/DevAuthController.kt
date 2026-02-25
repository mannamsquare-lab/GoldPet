package com.goldpet.domain.auth.controller

import com.goldpet.domain.auth.dto.AuthResponse
import com.goldpet.domain.auth.service.AuthService
import com.goldpet.domain.user.entity.User
import com.goldpet.domain.user.repository.UserRepository
import org.springframework.context.annotation.Profile
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/auth")
@Profile("local", "dev")
class DevAuthController(
    private val authService: AuthService,
    private val userRepository: UserRepository
) {
    @PostMapping("/dev-login")
    fun devLogin(@RequestBody(required = false) body: Map<String, String>?): ResponseEntity<AuthResponse> {
        val testEmail = body?.get("email") ?: "test@goldpet.com"
        val testNickname = body?.get("nickname") ?: "테스트유저"
        val oauthId = "dev-user-${testEmail.hashCode()}"
        val existingUser = userRepository.findByOauthProviderAndOauthId("dev", oauthId).orElse(null)
            ?: userRepository.findByEmailHash(testEmail).orElse(null)

        val user = if (existingUser == null) {
            val newUser = User(
                oauthProvider = "dev",
                oauthId = "dev-user-${testEmail.hashCode()}",
                nickname = testNickname,
                email = testEmail,
                emailHash = testEmail,
                gender = null,
                birthYear = null,
                mainLocationText = null,
                mainLocationGeom = null,
                profileImageUrl = null,
                username = null,
                password = null,
                name = null,
                birthDate = null,
                phoneNumber = null
            )
            userRepository.save(newUser)
        } else {
            existingUser
        }

        val response = authService.devLogin(user)
        return ResponseEntity.ok(response)
    }
}
