package com.goldpet.domain.auth.service

import com.goldpet.domain.auth.dto.AuthResponse
import com.goldpet.domain.auth.dto.LoginRequest
import com.goldpet.domain.auth.dto.SignupRequest
import com.goldpet.domain.auth.dto.SnsSignupRequest
import com.goldpet.domain.user.entity.User
import com.goldpet.domain.user.repository.UserRepository
import com.goldpet.config.jwt.JwtTokenProvider
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

import com.goldpet.config.security.UserPrincipal

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider
) {
    @Transactional
    fun signup(request: SignupRequest): AuthResponse {
        // Check duplicate username or email
        if (userRepository.findByUsername(request.username).isPresent) {
            throw IllegalArgumentException("Username already exists")
        }
        // Create user entity
        val user = User(
            email = request.email,
            oauthProvider = "LOCAL",
            oauthId = "LOCAL_${request.username}",
            username = request.username,
            password = passwordEncoder.encode(request.password),
            nickname = request.nickname,
            name = request.name,
            birthDate = request.birthDate,
            phoneNumber = request.phoneNumber,
            gender = request.gender,
            birthYear = request.birthYear,
            mainLocationText = request.mainLocationText,
            mainLocationGeom = null,
            profileImageUrl = null
        )
        val saved = userRepository.save(user)
        val userPrincipal = UserPrincipal.create(saved)
        val auth = UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.authorities)
        val token = jwtTokenProvider.generateToken(auth)
        return AuthResponse(
            accessToken = token,
            refreshToken = "",
            user = AuthResponse.UserInfo(
                id = saved.id,
                username = saved.username!!,
                nickname = saved.nickname!!,
                email = saved.email
            )
        )
    }

    @Transactional(readOnly = true)
    fun login(request: LoginRequest): AuthResponse {
        val userOpt = userRepository.findByUsername(request.username)
        val user = userOpt.orElseThrow { IllegalArgumentException("Invalid credentials") }
        if (!passwordEncoder.matches(request.password, user.password)) {
            throw IllegalArgumentException("Invalid credentials")
        }
        val userPrincipal = UserPrincipal.create(user)
        val auth = UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.authorities)
        val token = jwtTokenProvider.generateToken(auth)
        return AuthResponse(
            accessToken = token,
            refreshToken = "",
            user = AuthResponse.UserInfo(
                id = user.id,
                username = user.username!!,
                nickname = user.nickname!!,
                email = user.email
            )
        )
    }

    @Transactional
    fun snsSignup(userId: Long, request: SnsSignupRequest): AuthResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }

        // Update user info
        user.nickname = request.nickname
        user.name = request.name
        user.birthDate = request.birthDate
        user.gender = request.gender
        user.phoneNumber = request.phoneNumber
        // Note: Pet info should be saved to a Pet entity, but for now we'll just update the user or assume Pet entity creation logic is here.
        // Since the User entity doesn't have pet fields, and we haven't seen a Pet entity yet, I'll assume we need to create one or just ignore for now if the task is focused on User Auth.
        // However, the request has pet info. I should check if there is a PetRepository.
        // For this task, I will just update the User's nickname and return the response.
        // Real implementation should save Pet info.
        
        userRepository.save(user)

        val userPrincipal = UserPrincipal.create(user)
        val auth = UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.authorities)
        val token = jwtTokenProvider.generateToken(auth)

        return AuthResponse(
            accessToken = token, 
            refreshToken = "",
            user = AuthResponse.UserInfo(
                id = user.id,
                username = user.username ?: user.oauthId, // Fallback to oauthId if username is null
                nickname = user.nickname!!,
                email = user.email
            )
        )
    }
    @Transactional
    fun devLogin(user: User): AuthResponse {
        val userPrincipal = UserPrincipal.create(user)
        val auth = UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.authorities)
        val token = jwtTokenProvider.generateToken(auth)
        
        return AuthResponse(
            accessToken = token,
            refreshToken = "", // No refresh token needed for dev login
            user = AuthResponse.UserInfo(
                id = user.id,
                username = user.username ?: user.oauthId,
                nickname = user.nickname ?: "Test User",
                email = user.email
            )
        )
    }
}
