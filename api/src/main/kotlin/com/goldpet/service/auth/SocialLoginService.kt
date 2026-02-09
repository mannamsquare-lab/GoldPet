package com.goldpet.service.auth

import com.goldpet.config.jwt.JwtTokenProvider
import com.goldpet.config.security.UserPrincipal
import com.goldpet.domain.user.entity.User
import com.goldpet.domain.user.repository.UserRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.transaction.annotation.Transactional

import com.goldpet.domain.auth.dto.AuthResponse
import com.goldpet.domain.auth.exception.AccountStatusException
import com.goldpet.domain.user.entity.UserStatus
import java.math.BigInteger
import java.security.KeyFactory
import java.security.spec.RSAPublicKeySpec
import java.util.Base64
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.io.Decoders
import com.fasterxml.jackson.databind.ObjectMapper

@Service
class SocialLoginService(
    private val userRepository: UserRepository,
    private val jwtTokenProvider: JwtTokenProvider
) {
    private val restTemplate = RestTemplate()

    @Transactional
    fun loginWithKakao(accessToken: String): AuthResponse {
        // 1. Verify Token & Get User Info from Kakao
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

        // 2. Find or Create User
        var user = userRepository.findByOauthProviderAndOauthId("kakao", kakaoId).orElse(null)
        if (user == null) {
            user = User(
                oauthProvider = "kakao",
                oauthId = kakaoId,
                email = email,
                nickname = nickname,
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
             // Update info
            var changed = false
            if (email != null && user.email != email) { user.email = email; changed = true }
            if (nickname != null && user.nickname != nickname) { user.nickname = nickname; changed = true }
            if (profileImage != null && user.profileImageUrl != profileImage) { user.profileImageUrl = profileImage; changed = true }
            if (changed) userRepository.save(user)
        }

        // 3. Check account status and Generate JWT
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
                email = user.email
            )
        )
    }

    @Transactional
    fun loginWithNaver(accessToken: String): AuthResponse {
        // 1. Verify Token & Get User Info from Naver
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

        // 2. Find or Create User
        var user = userRepository.findByOauthProviderAndOauthId("naver", naverId).orElse(null)
        if (user == null) {
            user = User(
                oauthProvider = "naver",
                oauthId = naverId,
                email = email,
                nickname = nickname,
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
            // Update info
            var changed = false
            if (email != null && user.email != email) { user.email = email; changed = true }
            if (nickname != null && user.nickname != nickname) { user.nickname = nickname; changed = true }
            if (profileImage != null && user.profileImageUrl != profileImage) { user.profileImageUrl = profileImage; changed = true }
            if (changed) userRepository.save(user)
        }

        // 3. Check account status and Generate JWT
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
                email = user.email
            )
        )
    }

    @Transactional
    fun loginWithGoogle(accessToken: String): AuthResponse {
        // 1. Verify Token & Get User Info from Google
        // The 'accessToken' parameter here actually contains the 'idToken' from the client
        val url = "https://oauth2.googleapis.com/tokeninfo?id_token=$accessToken"

        val response = restTemplate.getForObject(url, Map::class.java)
        @Suppress("UNCHECKED_CAST")
        val attributes = response as Map<String, Any>
        
        val googleId = attributes["sub"].toString()
        val email = attributes["email"]?.toString()
        val nickname = attributes["name"]?.toString()
        val profileImage = attributes["picture"]?.toString()

        // 2. Find or Create User
        var user = userRepository.findByOauthProviderAndOauthId("google", googleId).orElse(null)
        if (user == null) {
            user = User(
                oauthProvider = "google",
                oauthId = googleId,
                email = email,
                nickname = nickname,
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
            // Update info
            var changed = false
            if (email != null && user.email != email) { user.email = email; changed = true }
            if (nickname != null && user.nickname != nickname) { user.nickname = nickname; changed = true }
            if (profileImage != null && user.profileImageUrl != profileImage) { user.profileImageUrl = profileImage; changed = true }
            if (changed) userRepository.save(user)
        }

        // 3. Check account status and Generate JWT
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
                email = user.email
            )
        )
    }

    @Transactional
    fun loginWithApple(identityToken: String): AuthResponse {
        // 1. Get Apple Public Keys
        val appleKeysResponse = restTemplate.getForObject(
            "https://appleid.apple.com/auth/keys",
            Map::class.java
        )
        @Suppress("UNCHECKED_CAST")
        val keys = appleKeysResponse?.get("keys") as? List<Map<String, Any>>
            ?: throw IllegalArgumentException("Failed to get Apple public keys")

        // 2. Parse Header to find kid
        val parts = identityToken.split(".")
        if (parts.size < 2) throw IllegalArgumentException("Invalid Identity Token format")
        
        val headerJson = String(Decoders.BASE64URL.decode(parts[0]))
        @Suppress("UNCHECKED_CAST")
        val header = ObjectMapper().readValue(headerJson, Map::class.java) as Map<String, Any>
        val kid = header["kid"] as String

        // 3. Find matching key
        val keyMap = keys.find { it["kid"] == kid }
            ?: throw IllegalArgumentException("Invalid key identifier")

        val n = BigInteger(1, Decoders.BASE64URL.decode(keyMap["n"] as String))
        val e = BigInteger(1, Decoders.BASE64URL.decode(keyMap["e"] as String))
        val publicKeySpec = RSAPublicKeySpec(n, e)
        val keyFactory = KeyFactory.getInstance("RSA")
        val publicKey = keyFactory.generatePublic(publicKeySpec)

        // 4. Verify Token
        val claims = Jwts.parser()
            .verifyWith(publicKey)
            .build()
            .parseSignedClaims(identityToken)
            .payload

        val appleId = claims.subject
        val email = claims["email"] as? String
        
        // 5. Find or Create User
        var user = userRepository.findByOauthProviderAndOauthId("apple", appleId).orElse(null)
        if (user == null) {
            user = User(
                oauthProvider = "apple",
                oauthId = appleId,
                email = email,
                nickname = "Apple User", // Default nickname
                profileImageUrl = null,
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
            // Update info if needed
            if (email != null && user.email != email) {
                user.email = email
                userRepository.save(user)
            }
        }

        // 6. Generate JWT
        // We need a map for attributes, but for Apple we just used claims. 
        // We can create a simple map or pass empty if generateJwt doesn't strictly need it for Apple.
        // generateJwt uses attributes for UserPrincipal.create. 
        // Let's create a map mimicking what we have.
        val attributes = mapOf(
            "sub" to appleId,
            "email" to (email ?: "")
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
                email = user.email
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

    private fun generateJwt(user: User, attributes: Map<String, Any>): String {
        val userPrincipal = UserPrincipal.create(user, attributes)
        val authentication = UsernamePasswordAuthenticationToken(
            userPrincipal,
            null,
            listOf(SimpleGrantedAuthority("ROLE_USER"))
        )
        return jwtTokenProvider.generateToken(authentication)
    }
}
