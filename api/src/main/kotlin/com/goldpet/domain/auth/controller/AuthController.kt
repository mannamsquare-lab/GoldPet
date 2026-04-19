package com.goldpet.domain.auth.controller

import com.goldpet.domain.common.exception.*
import com.goldpet.domain.auth.dto.AuthResponse
import com.goldpet.domain.auth.dto.LoginRequest
import com.goldpet.domain.auth.dto.SignupRequest
import com.goldpet.domain.auth.service.AuthService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import com.goldpet.domain.auth.dto.AvailabilityResponse
import com.goldpet.domain.user.repository.UserRepository

import com.goldpet.domain.auth.dto.ConfirmLinkRequest
import com.goldpet.domain.auth.dto.CheckUsernameRequest
import com.goldpet.domain.auth.dto.CheckNicknameRequest
import com.goldpet.domain.auth.dto.CheckEmailRequest
import com.goldpet.domain.auth.dto.EmailAvailabilityResponse
import com.goldpet.config.crypto.BlindIndexUtil
import com.goldpet.domain.auth.dto.FindUsernameRequest
import com.goldpet.domain.auth.dto.FindUsernameResponse
import com.goldpet.domain.auth.dto.NativeLoginRequest
import com.goldpet.domain.auth.dto.RefreshTokenRequest
import com.goldpet.domain.auth.dto.ResetPasswordRequest
import com.goldpet.domain.auth.dto.VerifyAccountRequest
import com.goldpet.service.auth.SocialLoginService
import com.goldpet.config.jwt.JwtTokenProvider
import com.goldpet.config.security.UserPrincipal
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken

@Tag(name = "인증", description = "회원가입, 로그인, 토큰 갱신, SNS 소셜 로그인 관련 API")
@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val authService: AuthService,
    private val userRepository: UserRepository,
    private val socialLoginService: SocialLoginService,
    private val jwtTokenProvider: JwtTokenProvider
) {
    @Operation(summary = "자체 회원가입")
    @PostMapping("/signup")
    fun signup(@Valid @RequestBody request: SignupRequest): ResponseEntity<AuthResponse> {
        val response = authService.signup(request)
        return ResponseEntity.status(201).body(response)
    }

    @Operation(summary = "자체 로그인 (이메일/비밀번호)")
    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<AuthResponse> {
        val response = authService.login(request)
        return ResponseEntity.ok(response)
    }

    @Operation(summary = "SNS 로그인 후 추가 정보 입력 (회원가입 완료)")
    @PostMapping("/sns-signup")
    fun snsSignup(
        @org.springframework.security.core.annotation.AuthenticationPrincipal principal: org.springframework.security.core.userdetails.UserDetails,
        @Valid @RequestBody request: com.goldpet.domain.auth.dto.SnsSignupRequest
    ): ResponseEntity<AuthResponse> {
        val userPrincipal = principal as com.goldpet.config.security.UserPrincipal
        val response = authService.snsSignup(userPrincipal.id, request)
        return ResponseEntity.ok(response)
    }

    @Operation(summary = "아이디 중복 확인")
    @PostMapping("/check-username")
    fun checkUsername(@Valid @RequestBody request: CheckUsernameRequest): ResponseEntity<AvailabilityResponse> {
        val username = request.username
        val exists = userRepository.findByUsername(username).isPresent
        return ResponseEntity.ok(AvailabilityResponse(!exists))
    }

    @Operation(summary = "닉네임 중복 확인")
    @PostMapping("/check-nickname")
    fun checkNickname(
        @org.springframework.security.core.annotation.AuthenticationPrincipal principal: org.springframework.security.core.userdetails.UserDetails?,
        @Valid @RequestBody request: CheckNicknameRequest
    ): ResponseEntity<AvailabilityResponse> {
        val nickname = request.nickname
        val existingUser = userRepository.findByNickname(nickname).orElse(null)
        val available = if (existingUser == null) {
            true
        } else if (principal != null) {
            // 인증된 사용자면 본인 닉네임은 중복이 아닌 것으로 처리
            val currentUserId = (principal as com.goldpet.config.security.UserPrincipal).id
            existingUser.id == currentUserId
        } else {
            false
        }
        return ResponseEntity.ok(AvailabilityResponse(available))
    }

    @Operation(summary = "이메일 중복 확인")
    @PostMapping("/check-email")
    fun checkEmail(@Valid @RequestBody request: CheckEmailRequest): ResponseEntity<EmailAvailabilityResponse> {
        val emailHash = BlindIndexUtil.hash(request.email)!!
        val existing = userRepository.findByEmailHash(emailHash).orElse(null)
        return if (existing == null) {
            ResponseEntity.ok(EmailAvailabilityResponse(available = true, provider = null))
        } else {
            ResponseEntity.ok(EmailAvailabilityResponse(available = false, provider = existing.oauthProvider?.uppercase() ?: "LOCAL"))
        }
    }

    @Operation(summary = "SNS 소셜 로그인 (카카오/네이버/구글/애플)")
    @PostMapping("/login/{provider}")
    fun nativeLogin(
        @PathVariable provider: String,
        @Valid @RequestBody request: NativeLoginRequest
    ): ResponseEntity<AuthResponse> {
        val accessToken = request.accessToken
        val authResponse = when (provider.lowercase()) {
            "kakao" -> socialLoginService.loginWithKakao(accessToken)
            "naver" -> socialLoginService.loginWithNaver(accessToken)
            "google" -> socialLoginService.loginWithGoogle(accessToken)
            "apple" -> socialLoginService.loginWithApple(accessToken)
            else -> throw BadRequestException("Unsupported provider: $provider")
        }
        return ResponseEntity.ok(authResponse)
    }

    @Operation(summary = "소셜 계정 연동 확인 (계정 병합 승인)")
    @PostMapping("/confirm-link")
    fun confirmLink(@Valid @RequestBody request: ConfirmLinkRequest): ResponseEntity<AuthResponse> {
        val response = socialLoginService.confirmLink(request.tempToken)
        return ResponseEntity.ok(response)
    }

    @Operation(summary = "아이디 찾기 (이메일/전화번호로 조회)")
    @PostMapping("/find-username")
    fun findUsername(@Valid @RequestBody request: FindUsernameRequest): ResponseEntity<FindUsernameResponse> {
        val response = authService.findUsername(request)
        return ResponseEntity.ok(response)
    }

    @Operation(summary = "계정 본인 인증 (비밀번호 재설정 전 검증)")
    @PostMapping("/verify-account")
    fun verifyAccount(@Valid @RequestBody request: VerifyAccountRequest): ResponseEntity<Map<String, Any>> {
        val resetToken = authService.verifyAccount(request)
        return ResponseEntity.ok(mapOf("verified" to true, "resetToken" to resetToken))
    }

    @Operation(summary = "비밀번호 재설정")
    @PostMapping("/reset-password")
    fun resetPassword(@Valid @RequestBody request: ResetPasswordRequest): ResponseEntity<Map<String, Any>> {
        authService.resetPassword(request)
        return ResponseEntity.ok(mapOf("success" to true))
    }

    @Operation(summary = "로그아웃 (클라이언트 토큰 무효화)")
    @PostMapping("/logout")
    fun logout(): ResponseEntity<Map<String, Boolean>> {
        // 클라이언트 측에서 토큰을 삭제하므로 서버에서는 성공 응답만 반환
        return ResponseEntity.ok(mapOf("success" to true))
    }

    @Operation(summary = "액세스 토큰 갱신 (리프레시 토큰으로 재발급)")
    @PostMapping("/refresh")
    fun refreshToken(@Valid @RequestBody request: RefreshTokenRequest): ResponseEntity<AuthResponse> {
        val refreshToken = request.refreshToken

        if (!jwtTokenProvider.validateRefreshToken(refreshToken)) {
            throw UnauthorizedException("Invalid refresh token")
        }

        val userId = jwtTokenProvider.getUserIdFromRefreshToken(refreshToken)
        val user = userRepository.findById(userId).orElseThrow { UnauthorizedException("Invalid refresh token") }

        val userPrincipal = UserPrincipal.create(user)
        val auth = UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.authorities)
        val newAccessToken = jwtTokenProvider.generateToken(auth)
        val newRefreshToken = jwtTokenProvider.generateRefreshToken(user.id)

        return ResponseEntity.ok(AuthResponse(
            accessToken = newAccessToken,
            refreshToken = newRefreshToken,
            user = AuthResponse.UserInfo(
                id = user.id,
                username = user.username ?: user.oauthId,
                nickname = user.nickname ?: "User",
                email = user.email,
                phoneNumber = user.phoneNumber
            )
        ))
    }
}
