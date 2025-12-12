package com.goldpet.domain.auth.controller

import com.goldpet.domain.auth.dto.AuthResponse
import com.goldpet.domain.auth.dto.LoginRequest
import com.goldpet.domain.auth.dto.SignupRequest
import com.goldpet.domain.auth.service.AuthService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import com.goldpet.domain.auth.dto.AvailabilityResponse
import com.goldpet.domain.user.repository.UserRepository

import com.goldpet.service.auth.SocialLoginService

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val authService: AuthService,
    private val userRepository: UserRepository,
    private val socialLoginService: SocialLoginService
) {
    @PostMapping("/signup")
    fun signup(@Valid @RequestBody request: SignupRequest): ResponseEntity<AuthResponse> {
        val response = authService.signup(request)
        return ResponseEntity.status(201).body(response)
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<AuthResponse> {
        val response = authService.login(request)
        return ResponseEntity.ok(response)
    }

    @PostMapping("/sns-signup")
    fun snsSignup(
        @org.springframework.security.core.annotation.AuthenticationPrincipal principal: org.springframework.security.core.userdetails.UserDetails,
        @Valid @RequestBody request: com.goldpet.domain.auth.dto.SnsSignupRequest
    ): ResponseEntity<AuthResponse> {
        val userPrincipal = principal as com.goldpet.config.security.UserPrincipal
        val response = authService.snsSignup(userPrincipal.id, request)
        return ResponseEntity.ok(response)
    }

    @PostMapping("/check-username")
    fun checkUsername(@RequestBody body: Map<String, String>): ResponseEntity<AvailabilityResponse> {
        val username = body["username"] ?: return ResponseEntity.badRequest().build()
        val exists = userRepository.findByUsername(username).isPresent
        return ResponseEntity.ok(AvailabilityResponse(!exists))
    }

    @PostMapping("/check-nickname")
    fun checkNickname(@RequestBody body: Map<String, String>): ResponseEntity<AvailabilityResponse> {
        val nickname = body["nickname"] ?: return ResponseEntity.badRequest().build()
        val exists = userRepository.findByNickname(nickname).isPresent
        return ResponseEntity.ok(AvailabilityResponse(!exists))
    }
    @PostMapping("/login/{provider}")
    fun nativeLogin(
        @PathVariable provider: String,
        @RequestBody request: Map<String, String>
    ): ResponseEntity<AuthResponse> {
        val accessToken = request["accessToken"] ?: throw IllegalArgumentException("Access token is required")
        val authResponse = when (provider.lowercase()) {
            "kakao" -> socialLoginService.loginWithKakao(accessToken)
            "naver" -> socialLoginService.loginWithNaver(accessToken)
            "google" -> socialLoginService.loginWithGoogle(accessToken)
            "apple" -> socialLoginService.loginWithApple(accessToken)
            else -> throw IllegalArgumentException("Unsupported provider: $provider")
        }
        return ResponseEntity.ok(authResponse)
    }
}
