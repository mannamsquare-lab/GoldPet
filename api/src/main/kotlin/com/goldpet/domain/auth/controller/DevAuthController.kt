package com.goldpet.domain.auth.controller

import com.goldpet.domain.auth.dto.AuthResponse
import com.goldpet.domain.auth.service.AuthService
import com.goldpet.config.openapi.OpenApiInternal
import org.springframework.context.annotation.Profile
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@OpenApiInternal
@RestController
@RequestMapping("/api/v1/auth")
@Profile("local", "dev")
class DevAuthController(
    private val authService: AuthService
) {
    @PostMapping("/dev-login")
    fun devLogin(@RequestBody(required = false) body: Map<String, String>?): ResponseEntity<AuthResponse> {
        val testEmail = body?.get("email") ?: "test@goldpet.com"
        val testNickname = body?.get("nickname") ?: "테스트유저"
        // ARCH-005: 리포지토리 직접 조회/생성 → 서비스 계약
        val user = authService.getOrCreateDevUser(testEmail, testNickname)
        return ResponseEntity.ok(authService.devLogin(user))
    }
}
