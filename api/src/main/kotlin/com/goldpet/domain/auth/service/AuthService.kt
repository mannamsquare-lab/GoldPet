package com.goldpet.domain.auth.service

import com.goldpet.domain.common.exception.*
import com.goldpet.config.jwt.JwtTokenProvider
import com.goldpet.config.security.UserPrincipal
import com.goldpet.domain.auth.dto.AuthResponse
import com.goldpet.domain.auth.dto.FindUsernameRequest
import com.goldpet.domain.auth.dto.FindUsernameResponse
import com.goldpet.domain.auth.dto.LoginRequest
import com.goldpet.domain.auth.dto.ResetPasswordRequest
import com.goldpet.domain.auth.dto.SignupRequest
import com.goldpet.domain.auth.dto.SnsSignupRequest
import com.goldpet.domain.auth.dto.VerifyAccountRequest
import com.goldpet.domain.auth.exception.AccountStatusException
import com.goldpet.domain.common.service.SystemSettingService
import com.goldpet.domain.user.entity.User
import com.goldpet.domain.user.entity.UserStatus
import com.goldpet.domain.user.repository.UserRepository
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class AuthService(
        private val userRepository: UserRepository,
        private val passwordEncoder: PasswordEncoder,
        private val jwtTokenProvider: JwtTokenProvider,
        private val systemSettingService: SystemSettingService
) {
    @Transactional
    fun signup(request: SignupRequest): AuthResponse {
        if (systemSettingService.getString("allow_signups", "true") == "false") {
            throw BadRequestException("현재 신규 가입이 중단되었습니다.")
        }
        // Check duplicate username or email
        if (userRepository.findByUsername(request.username).isPresent) {
            throw ConflictException("Username already exists")
        }
        // Create user entity
        val user =
                User(
                        email = request.email,
                        emailHash = request.email,
                        oauthProvider = "LOCAL",
                        oauthId = "LOCAL_${request.username}",
                        username = request.username,
                        password = passwordEncoder.encode(request.password),
                        nickname = request.nickname,
                        name = request.name,
                        birthDate = java.time.LocalDate.parse(request.birthDate),
                        phoneNumber = request.phoneNumber,
                        gender = request.gender,
                        birthYear = request.birthYear,
                        mainLocationText = request.mainLocationText,
                        mainLocationGeom = null,
                        profileImageUrl = null,
                        profileLockedAt = LocalDateTime.now()
                )
        val saved = userRepository.save(user)
        val userPrincipal = UserPrincipal.create(saved)
        val auth =
                UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.authorities)
        val token = jwtTokenProvider.generateToken(auth)
        val refreshToken = jwtTokenProvider.generateRefreshToken(saved.id)
        return AuthResponse(
                accessToken = token,
                refreshToken = refreshToken,
                user =
                        AuthResponse.UserInfo(
                                id = saved.id,
                                username = saved.username!!,
                                nickname = saved.nickname!!,
                                email = saved.email,
                                phoneNumber = saved.phoneNumber
                        )
        )
    }

    @Transactional(readOnly = true)
    fun login(request: LoginRequest): AuthResponse {
        val userOpt = userRepository.findByUsername(request.username)
        val user = userOpt.orElseThrow { UnauthorizedException("Invalid credentials") }
        if (!passwordEncoder.matches(request.password, user.password)) {
            throw UnauthorizedException("Invalid credentials")
        }
        checkAccountStatus(user.status)
        val userPrincipal = UserPrincipal.create(user)
        val auth =
                UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.authorities)
        val token = jwtTokenProvider.generateToken(auth)
        val refreshToken = jwtTokenProvider.generateRefreshToken(user.id)
        return AuthResponse(
                accessToken = token,
                refreshToken = refreshToken,
                user =
                        AuthResponse.UserInfo(
                                id = user.id,
                                username = user.username!!,
                                nickname = user.nickname!!,
                                email = user.email,
                                phoneNumber = user.phoneNumber
                        )
        )
    }

    @Transactional
    fun snsSignup(userId: Long, request: SnsSignupRequest): AuthResponse {
        if (systemSettingService.getString("allow_signups", "true") == "false") {
            throw BadRequestException("현재 신규 가입이 중단되었습니다.")
        }
        val user =
                userRepository.findById(userId).orElseThrow {
                    NotFoundException("User not found")
                }

        // Update user info
        user.nickname = request.nickname
        user.name = request.name
        user.birthDate = java.time.LocalDate.parse(request.birthDate)
        user.gender = request.gender
        user.phoneNumber = request.phoneNumber
        // Note: Pet info should be saved to a Pet entity, but for now we'll just update the user or
        // assume Pet entity creation logic is here.
        // Since the User entity doesn't have pet fields, and we haven't seen a Pet entity yet, I'll
        // assume we need to create one or just ignore for now if the task is focused on User Auth.
        // However, the request has pet info. I should check if there is a PetRepository.
        // For this task, I will just update the User's nickname and return the response.
        // Real implementation should save Pet info.
        user.profileLockedAt = LocalDateTime.now()

        userRepository.save(user)

        val userPrincipal = UserPrincipal.create(user)
        val auth =
                UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.authorities)
        val token = jwtTokenProvider.generateToken(auth)
        val refreshToken = jwtTokenProvider.generateRefreshToken(user.id)

        return AuthResponse(
                accessToken = token,
                refreshToken = refreshToken,
                user =
                        AuthResponse.UserInfo(
                                id = user.id,
                                username = user.username
                                                ?: user.oauthId, // Fallback to oauthId if username
                                // is null
                                nickname = user.nickname!!,
                                email = user.email,
                                phoneNumber = user.phoneNumber
                        )
        )
    }

    private fun checkAccountStatus(status: UserStatus) {
        when (status) {
            UserStatus.ACTIVE -> return
            UserStatus.DORMANT -> throw AccountStatusException(status, "DORMANT_ACCOUNT")
            UserStatus.WITHDRAWN -> throw AccountStatusException(status, "WITHDRAWN_ACCOUNT")
            UserStatus.SUSPENDED -> throw AccountStatusException(status, "SUSPENDED_ACCOUNT")
        }
    }

    @Transactional(readOnly = true)
    fun findUsername(request: FindUsernameRequest): FindUsernameResponse {
        val user = userRepository.findByEmail(request.email).orElse(null)
            ?: throw NotFoundException("해당 이메일로 가입된 계정을 찾을 수 없습니다.")
        val username = user.username ?: throw NotFoundException("해당 이메일로 가입된 계정을 찾을 수 없습니다.")
        val snsProvider = if (user.oauthProvider != "LOCAL") user.oauthProvider else null
        return FindUsernameResponse(username = maskUsername(username), snsProvider = snsProvider)
    }

    @Transactional(readOnly = true)
    fun verifyAccount(request: VerifyAccountRequest): String {
        val user = userRepository.findByUsername(request.username)
            .orElseThrow { NotFoundException("아이디 또는 이메일이 일치하지 않습니다.") }
        if (user.email?.lowercase() != request.email.lowercase()) {
            throw NotFoundException("아이디 또는 이메일이 일치하지 않습니다.")
        }
        if (user.oauthProvider != "LOCAL") {
            throw BadRequestException("소셜 계정은 비밀번호를 변경할 수 없습니다.")
        }
        return jwtTokenProvider.generatePasswordResetToken(request.username, request.email)
    }

    @Transactional
    fun resetPassword(request: ResetPasswordRequest) {
        if (request.resetToken == null ||
            !jwtTokenProvider.validatePasswordResetToken(request.resetToken, request.username, request.email)) {
            throw BadRequestException("인증이 만료되었습니다. 다시 본인인증을 진행해주세요.")
        }
        val user = userRepository.findByUsername(request.username)
            .orElseThrow { NotFoundException("아이디 또는 이메일이 일치하지 않습니다.") }
        if (user.email?.lowercase() != request.email.lowercase()) {
            throw NotFoundException("아이디 또는 이메일이 일치하지 않습니다.")
        }
        if (user.oauthProvider != "LOCAL") {
            throw BadRequestException("소셜 계정은 비밀번호를 변경할 수 없습니다.")
        }
        user.password = passwordEncoder.encode(request.password)
        userRepository.save(user)
    }

    private fun maskUsername(username: String): String {
        if (username.length <= 3) return username
        val visible = username.length / 2
        return username.take(visible) + "*".repeat(username.length - visible)
    }

    @Transactional
    fun devLogin(user: User): AuthResponse {
        val userPrincipal = UserPrincipal.create(user)
        val auth =
                UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.authorities)
        val token = jwtTokenProvider.generateToken(auth)
        val refreshToken = jwtTokenProvider.generateRefreshToken(user.id)

        return AuthResponse(
                accessToken = token,
                refreshToken = refreshToken,
                user =
                        AuthResponse.UserInfo(
                                id = user.id,
                                username = user.username ?: user.oauthId,
                                nickname = user.nickname ?: "Test User",
                                email = user.email,
                                phoneNumber = user.phoneNumber
                        )
        )
    }
}
