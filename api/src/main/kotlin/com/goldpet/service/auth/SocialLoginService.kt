package com.goldpet.service.auth

import com.goldpet.config.jwt.JwtTokenProvider
import com.goldpet.config.security.UserPrincipal
import com.goldpet.domain.auth.dto.AuthResponse
import com.goldpet.domain.auth.dto.LinkSuggestionInfo
import com.goldpet.domain.auth.entity.UserAuthProvider
import com.goldpet.domain.auth.exception.AccountStatusException
import com.goldpet.domain.auth.repository.UserAuthProviderRepository
import com.goldpet.domain.common.exception.*
import com.goldpet.domain.common.service.SystemSettingService
import com.goldpet.domain.user.entity.User
import com.goldpet.domain.user.entity.UserStatus
import com.goldpet.domain.user.repository.UserRepository
import com.fasterxml.jackson.databind.ObjectMapper
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.client.RestTemplate
import java.math.BigInteger
import java.security.KeyFactory
import java.security.spec.RSAPublicKeySpec
import java.time.LocalDateTime
import java.util.Base64
import java.util.Date
import javax.crypto.SecretKey

@Service
class SocialLoginService(
    private val userRepository: UserRepository,
    private val jwtTokenProvider: JwtTokenProvider,
    private val userAuthProviderRepository: UserAuthProviderRepository,
    private val systemSettingService: SystemSettingService,
    @Value("\${app.jwt.secret}")
    private val jwtSecret: String
) {
    private val restTemplate = RestTemplate()
    private val linkSuggestionTtlMs = 5 * 60 * 1000L // 5 minutes

    private val tempKey: SecretKey by lazy {
        Keys.hmacShaKeyFor(jwtSecret.toByteArray())
    }

    // --- Kakao ---

    @Transactional
    fun loginWithKakao(accessToken: String): AuthResponse {
        val headers = HttpHeaders()
        headers.setBearerAuth(accessToken)
        val entity = HttpEntity<String>(headers)

        val response = restTemplate.exchange(
            "https://kapi.kakao.com/v2/user/me",
            HttpMethod.GET,
            entity,
            Map::class.java
        )

        @Suppress("UNCHECKED_CAST")
        val attributes = response.body as Map<String, Any>
        val kakaoId = attributes["id"].toString()

        val account = attributes["kakao_account"] as? Map<*, *>
        val profile = account?.get("profile") as? Map<*, *>
        val props = attributes["properties"] as? Map<*, *>

        val email = account?.get("email")?.toString()
        val nickname = profile?.get("nickname")?.toString()
            ?: props?.get("nickname")?.toString()
        val profileImage = profile?.get("profile_image_url")?.toString()
            ?: props?.get("profile_image")?.toString()
            ?: account?.get("profile_image_url")?.toString()

        return handleOAuthLogin(
            provider = "kakao",
            oauthId = kakaoId,
            email = email,
            nickname = nickname,
            profileImage = profileImage,
            attributes = attributes,
            skipEmailMatch = false
        )
    }

    // --- Naver ---

    @Transactional
    fun loginWithNaver(accessToken: String): AuthResponse {
        val headers = HttpHeaders()
        headers.setBearerAuth(accessToken)
        val entity = HttpEntity<String>(headers)

        val response = restTemplate.exchange(
            "https://openapi.naver.com/v1/nid/me",
            HttpMethod.GET,
            entity,
            Map::class.java
        )

        @Suppress("UNCHECKED_CAST")
        val attributes = response.body as Map<String, Any>
        @Suppress("UNCHECKED_CAST")
        val resp = attributes["response"] as Map<String, Any>

        val naverId = resp["id"].toString()
        val email = resp["email"]?.toString()
        val nickname = resp["name"]?.toString()
        val profileImage = resp["profile_image"]?.toString()

        return handleOAuthLogin(
            provider = "naver",
            oauthId = naverId,
            email = email,
            nickname = nickname,
            profileImage = profileImage,
            attributes = attributes,
            skipEmailMatch = false
        )
    }

    // --- Google ---

    @Transactional
    fun loginWithGoogle(accessToken: String): AuthResponse {
        val url = "https://oauth2.googleapis.com/tokeninfo?id_token=$accessToken"
        val response = restTemplate.getForObject(url, Map::class.java)
        @Suppress("UNCHECKED_CAST")
        val attributes = response as Map<String, Any>

        val googleId = attributes["sub"].toString()
        val email = attributes["email"]?.toString()
        val nickname = attributes["name"]?.toString()
        val profileImage = attributes["picture"]?.toString()

        return handleOAuthLogin(
            provider = "google",
            oauthId = googleId,
            email = email,
            nickname = nickname,
            profileImage = profileImage,
            attributes = attributes,
            skipEmailMatch = false
        )
    }

    // --- Apple ---

    @Transactional
    fun loginWithApple(identityToken: String): AuthResponse {
        val appleKeysResponse = restTemplate.getForObject(
            "https://appleid.apple.com/auth/keys",
            Map::class.java
        )
        @Suppress("UNCHECKED_CAST")
        val keys = appleKeysResponse?.get("keys") as? List<Map<String, Any>>
            ?: throw BadRequestException("Failed to get Apple public keys")

        val parts = identityToken.split(".")
        if (parts.size < 2) throw BadRequestException("Invalid Identity Token format")

        val headerJson = String(Decoders.BASE64URL.decode(parts[0]))
        @Suppress("UNCHECKED_CAST")
        val header = ObjectMapper().readValue(headerJson, Map::class.java) as Map<String, Any>
        val kid = header["kid"] as String

        val keyMap = keys.find { it["kid"] == kid }
            ?: throw BadRequestException("Invalid key identifier")

        val n = BigInteger(1, Decoders.BASE64URL.decode(keyMap["n"] as String))
        val e = BigInteger(1, Decoders.BASE64URL.decode(keyMap["e"] as String))
        val publicKeySpec = RSAPublicKeySpec(n, e)
        val keyFactory = KeyFactory.getInstance("RSA")
        val publicKey = keyFactory.generatePublic(publicKeySpec)

        val claims = Jwts.parser()
            .verifyWith(publicKey)
            .build()
            .parseSignedClaims(identityToken)
            .payload

        val appleId = claims.subject
        val email = claims["email"] as? String

        val attributes = mapOf(
            "sub" to appleId,
            "email" to (email ?: "")
        )

        // Apple private relay emails skip email matching
        val skipEmailMatch = email?.contains("@privaterelay.appleid.com") == true

        return handleOAuthLogin(
            provider = "apple",
            oauthId = appleId,
            email = email,
            nickname = null,
            profileImage = null,
            attributes = attributes,
            skipEmailMatch = skipEmailMatch
        )
    }

    // --- Core logic ---

    private fun handleOAuthLogin(
        provider: String,
        oauthId: String,
        email: String?,
        nickname: String?,
        profileImage: String?,
        attributes: Map<String, Any>,
        skipEmailMatch: Boolean
    ): AuthResponse {
        val linkSuggestionEnabled = systemSettingService.getBoolean("auth.link_suggestion.enabled", false)

        if (!linkSuggestionEnabled) {
            // Original auto-link behavior
            return legacyLogin(provider, oauthId, email, nickname, profileImage, attributes)
        }

        // 1. Check by provider + oauthId in user_auth_providers table
        val existingProvider = userAuthProviderRepository.findByProviderAndProviderId(provider, oauthId).orElse(null)
        if (existingProvider != null) {
            val user = existingProvider.user
            checkAccountStatus(user.status)
            // Also sync legacy users table fields
            syncUserFields(user, provider, oauthId, email, nickname, profileImage)
            val token = generateJwt(user, attributes)
            val refreshToken = jwtTokenProvider.generateRefreshToken(user.id)
            return AuthResponse(
                accessToken = token,
                refreshToken = refreshToken,
                user = AuthResponse.UserInfo(
                    id = user.id,
                    username = user.username ?: user.nickname ?: "User",
                    nickname = user.nickname ?: "User",
                    email = user.email,
                    phoneNumber = user.phoneNumber
                )
            )
        }

        // 2. Email match check
        val emailMatchedUser = if (!skipEmailMatch && email != null) {
            userRepository.findByEmailHash(email).orElse(null)
        } else null

        if (emailMatchedUser != null) {
            // Email matched a different provider — suggest linking instead of auto-linking
            val existingProviders = userAuthProviderRepository.findAllByUserId(emailMatchedUser.id)
            val existingProviderName = existingProviders.firstOrNull()?.provider
                ?: emailMatchedUser.oauthProvider.ifBlank { "unknown" }

            val tempToken = generateLinkSuggestionToken(emailMatchedUser.id, provider, oauthId)
            return AuthResponse(
                accessToken = "",
                refreshToken = "",
                user = AuthResponse.UserInfo(
                    id = 0,
                    username = "",
                    nickname = "",
                    email = null
                ),
                linkSuggestion = LinkSuggestionInfo(
                    maskedEmail = maskEmail(email!!),
                    existingProvider = existingProviderName,
                    tempToken = tempToken
                )
            )
        }

        // 3. No match — create new user + dual-write UserAuthProvider
        var user = User(
            oauthProvider = provider,
            oauthId = oauthId,
            email = email,
            emailHash = email,
            nickname = nickname ?: if (provider == "apple") "Apple User" else null,
            profileImageUrl = profileImage,
            username = null,
            password = null,
            gender = null,
            birthYear = null,
            mainLocationText = null,
            mainLocationGeom = null,
            name = null,
            birthDate = null,
            phoneNumber = null
        )
        user = userRepository.save(user)

        userAuthProviderRepository.save(
            UserAuthProvider(
                user = user,
                provider = provider,
                providerId = oauthId,
                isPrimary = true
            )
        )

        checkAccountStatus(user.status)
        val token = generateJwt(user, attributes)
        val refreshToken = jwtTokenProvider.generateRefreshToken(user.id)

        return AuthResponse(
            accessToken = token,
            refreshToken = refreshToken,
            user = AuthResponse.UserInfo(
                id = user.id,
                username = user.username ?: user.nickname ?: "User",
                nickname = user.nickname ?: "User",
                email = user.email,
                phoneNumber = user.phoneNumber
            )
        )
    }

    // Original behavior (flag OFF)
    private fun legacyLogin(
        provider: String,
        oauthId: String,
        email: String?,
        nickname: String?,
        profileImage: String?,
        attributes: Map<String, Any>
    ): AuthResponse {
        var user = userRepository.findByOauthProviderAndOauthId(provider, oauthId).orElse(null)
        if (user == null && email != null) {
            user = userRepository.findByEmailHash(email).orElse(null)
        }
        if (user == null) {
            user = User(
                oauthProvider = provider,
                oauthId = oauthId,
                email = email,
                emailHash = email,
                nickname = nickname ?: if (provider == "apple") "Apple User" else null,
                profileImageUrl = profileImage,
                username = null,
                password = null,
                gender = null,
                birthYear = null,
                mainLocationText = null,
                mainLocationGeom = null,
                name = null,
                birthDate = null,
                phoneNumber = null
            )
            user = userRepository.save(user)
        } else {
            syncUserFields(user, provider, oauthId, email, nickname, profileImage)
        }

        checkAccountStatus(user.status)
        val token = generateJwt(user, attributes)
        val refreshToken = jwtTokenProvider.generateRefreshToken(user.id)

        return AuthResponse(
            accessToken = token,
            refreshToken = refreshToken,
            user = AuthResponse.UserInfo(
                id = user.id,
                username = user.username ?: user.nickname ?: "User",
                nickname = user.nickname ?: "User",
                email = user.email,
                phoneNumber = user.phoneNumber
            )
        )
    }

    private fun syncUserFields(user: User, provider: String, oauthId: String, email: String?, nickname: String?, profileImage: String?) {
        var changed = false
        if (email != null && user.email != email) { user.email = email; user.emailHash = email; changed = true }
        if (nickname != null && user.nickname == null) { user.nickname = nickname; changed = true }
        if (profileImage != null && user.profileImages.isEmpty() && user.profileImageUrl != profileImage) { user.profileImageUrl = profileImage; changed = true }
        if (user.oauthProvider.isBlank()) { user.oauthProvider = provider; user.oauthId = oauthId; changed = true }
        if (changed) userRepository.save(user)
    }

    // --- Confirm link (called by AuthController) ---

    @Transactional
    fun confirmLink(tempToken: String): AuthResponse {
        val claims = try {
            Jwts.parser()
                .verifyWith(tempKey)
                .build()
                .parseSignedClaims(tempToken)
                .payload
        } catch (ex: Exception) {
            throw BadRequestException("Invalid or expired link token")
        }

        if (claims["type"] != "LINK_SUGGESTION") {
            throw BadRequestException("Invalid token type")
        }

        val userId = claims.subject.toLong()
        val newProvider = claims["newProvider"] as String
        val newProviderId = claims["newProviderId"] as String

        val user = userRepository.findById(userId)
            .orElseThrow { NotFoundException("User not found") }

        // Link the new provider (idempotent)
        val alreadyLinked = userAuthProviderRepository.findByProviderAndProviderId(newProvider, newProviderId).isPresent
        if (!alreadyLinked) {
            userAuthProviderRepository.save(
                UserAuthProvider(
                    user = user,
                    provider = newProvider,
                    providerId = newProviderId,
                    isPrimary = false
                )
            )
        }

        checkAccountStatus(user.status)
        val attributes = mapOf<String, Any>()
        val token = generateJwt(user, attributes)
        val refreshToken = jwtTokenProvider.generateRefreshToken(user.id)

        return AuthResponse(
            accessToken = token,
            refreshToken = refreshToken,
            user = AuthResponse.UserInfo(
                id = user.id,
                username = user.username ?: user.nickname ?: "User",
                nickname = user.nickname ?: "User",
                email = user.email,
                phoneNumber = user.phoneNumber
            )
        )
    }

    // --- Helpers ---

    private fun checkAccountStatus(status: UserStatus) {
        when (status) {
            UserStatus.ACTIVE -> return
            UserStatus.DORMANT -> throw AccountStatusException(status, "DORMANT_ACCOUNT")
            UserStatus.WITHDRAWN -> throw AccountStatusException(status, "WITHDRAWN_ACCOUNT")
            UserStatus.SUSPENDED -> throw AccountStatusException(status, "SUSPENDED_ACCOUNT")
        }
    }

    private fun generateJwt(user: User, attributes: Map<String, Any>): String {
        val userPrincipal = UserPrincipal.create(user, attributes)
        val authentication = UsernamePasswordAuthenticationToken(
            userPrincipal,
            null,
            listOf(SimpleGrantedAuthority("ROLE_USER"))
        )
        return jwtTokenProvider.generateToken(authentication)
    }

    private fun generateLinkSuggestionToken(userId: Long, newProvider: String, newProviderId: String): String {
        val now = Date()
        val expiry = Date(now.time + linkSuggestionTtlMs)
        return Jwts.builder()
            .subject(userId.toString())
            .claim("type", "LINK_SUGGESTION")
            .claim("newProvider", newProvider)
            .claim("newProviderId", newProviderId)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(tempKey)
            .compact()
    }

    private fun maskEmail(email: String): String {
        val atIndex = email.indexOf('@')
        if (atIndex <= 0) return "***"
        val local = email.substring(0, atIndex)
        val domain = email.substring(atIndex)
        val masked = if (local.length <= 1) "*" else local[0] + "***"
        return "$masked$domain"
    }
}
