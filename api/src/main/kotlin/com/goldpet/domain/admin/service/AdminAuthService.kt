package com.goldpet.domain.admin.service

import com.goldpet.config.crypto.BlindIndexUtil
import com.goldpet.config.jwt.JwtTokenProvider
import com.goldpet.config.security.AdminUserPrincipal
import com.goldpet.domain.admin.entity.AdminUser
import com.goldpet.domain.admin.repository.AdminUserRepository
import com.goldpet.domain.common.exception.BadRequestException
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Duration
import java.time.LocalDateTime

@Service
class AdminAuthService(
    private val adminUserRepository: AdminUserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider,
    private val adminTotpService: AdminTotpService
) {

    companion object {
        val ADMIN_PASSWORD_REGEX = Regex("^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#\$%^&*()_+\\-=\\[\\]{}|;:',.<>?/~`]).{8,}$")

        /** V69 — TOTP code 재사용 차단 window (Google Authenticator 30s step + 약간의 여유). */
        const val TOTP_REPLAY_WINDOW_SECONDS: Long = 30
    }

    @Transactional
    fun login(email: String, passwordRaw: String): Pair<String?, AdminUser> {
        val emailHash = BlindIndexUtil.hash(email)
            ?: throw BadCredentialsException("Invalid Email or Password")
        val adminUser = adminUserRepository.findByEmailHash(emailHash)
            .orElseThrow { BadCredentialsException("Invalid Email or Password") }

        if (!passwordEncoder.matches(passwordRaw, adminUser.passwordHash)) {
            throw BadCredentialsException("Invalid Email or Password")
        }

        if (!adminUser.isActive) {
            throw BadCredentialsException("Account is disabled")
        }

        adminUser.lastLoginAt = LocalDateTime.now()

        // If user has 2FA enabled (otpSecret is set), return null token to signal 2FA requirement
        if (!adminUser.otpSecret.isNullOrBlank()) {
            return Pair(null, adminUser)
        }

        // Otherwise return full token
        val token = generateToken(adminUser)
        return Pair(token, adminUser)
    }

    @Transactional
    fun changePassword(adminUserId: Long, currentPassword: String, newPassword: String) {
        val adminUser = adminUserRepository.findById(adminUserId)
            .orElseThrow { BadCredentialsException("User not found") }

        if (!passwordEncoder.matches(currentPassword, adminUser.passwordHash)) {
            throw BadCredentialsException("Invalid current password")
        }

        if (!ADMIN_PASSWORD_REGEX.matches(newPassword)) {
            throw BadRequestException("비밀번호는 8자 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다.")
        }

        adminUser.passwordHash = passwordEncoder.encode(newPassword)
        adminUser.mustChangePassword = false
    }

    @Transactional
    fun verify2fa(userId: Long, code: Int): Pair<String, AdminUser> {
        val adminUser = adminUserRepository.findById(userId)
            .orElseThrow { BadCredentialsException("User not found") }

        if (adminUser.otpSecret.isNullOrBlank()) {
            throw BadCredentialsException("2FA not set up")
        }

        if (!adminTotpService.validateCode(adminUser.otpSecret!!, code)) {
            throw BadCredentialsException("Invalid 2FA Code")
        }

        // V69 — replay 차단. 동일 30s window 코드 재사용 거부 (탈취된 OTP screenshot 재사용 방지).
        val now = LocalDateTime.now()
        val lastUsed = adminUser.lastOtpUsedAt
        if (lastUsed != null && Duration.between(lastUsed, now).seconds < TOTP_REPLAY_WINDOW_SECONDS) {
            throw BadCredentialsException("2FA Code already used recently — wait for next code")
        }
        adminUser.lastOtpUsedAt = now

        return Pair(generateToken(adminUser), adminUser)
    }

    @Transactional
    fun setup2fa(userId: Long): Pair<String, String> {
        val adminUser = adminUserRepository.findById(userId)
            .orElseThrow { RuntimeException("User not found") }
        
        val secret = adminTotpService.generateSecret()
        val qrUrl = adminTotpService.getQrCodeUrl(secret, adminUser.email)
        
        return Pair(secret, qrUrl)
    }

    @Transactional
    fun confirm2fa(userId: Long, secret: String, code: Int) {
        val adminUser = adminUserRepository.findById(userId)
            .orElseThrow { RuntimeException("User not found") }

        if (!adminTotpService.validateCode(secret, code)) {
            throw BadRequestException("Invalid Code")
        }

        adminUser.otpSecret = secret
        // Hibernate dirty checking saves it
    }
    
    @Transactional
    fun cancel2fa(userId: Long) {
         val adminUser = adminUserRepository.findById(userId)
            .orElseThrow { RuntimeException("User not found") }
         adminUser.otpSecret = null
    }

    private fun generateToken(adminUser: AdminUser): String {
        val principal = AdminUserPrincipal(adminUser)
        val authentication = org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
            principal, null, principal.authorities
        )
        return jwtTokenProvider.generateToken(authentication)
    }
}
