package com.goldpet.config.jwt

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import com.goldpet.config.security.UserPrincipal
import com.goldpet.config.security.AdminUserPrincipal
import org.springframework.stereotype.Component
import java.util.Date
import javax.crypto.SecretKey

@Component
class JwtTokenProvider(
    @Value("\${app.jwt.secret}")
    private val jwtSecret: String,

    @Value("\${app.jwt.expiration-ms}")
    private val jwtExpirationMs: Long,

    @Value("\${app.jwt.refresh-expiration-ms:2592000000}")
    private val refreshExpirationMs: Long = 2592000000
) {
    private val key: SecretKey = Keys.hmacShaKeyFor(jwtSecret.toByteArray())

    fun generateToken(authentication: Authentication): String {
        val principal = authentication.principal
        
        val now = Date()
        val expiryDate = Date(now.time + jwtExpirationMs)
        
        val builder = Jwts.builder()
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(key)

        if (principal is UserPrincipal) {
            builder.subject(principal.id.toString())
            builder.claim("type", "USER")
        } else if (principal is AdminUserPrincipal) {
            builder.subject(principal.id.toString())
            builder.claim("type", "ADMIN")
        } else {
            throw IllegalArgumentException("Unknown principal type")
        }

        return builder.compact()
    }

    fun validateToken(authToken: String): Boolean {
        return try {
            Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(authToken)
            true
        } catch (ex: Exception) {
            false
        }
    }

    fun getUserIdFromJWT(token: String): String {
        val claims = Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .payload
        return claims.subject
    }
    
    fun getUserTypeFromJWT(token: String): String {
        val claims = Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .payload
        return claims["type"] as String? ?: "USER" // Default to USER if missing for backward compatibility
    }

    fun generateRefreshToken(userId: Long): String {
        val now = Date()
        val expiryDate = Date(now.time + refreshExpirationMs)

        return Jwts.builder()
            .subject(userId.toString())
            .claim("type", "REFRESH")
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(key)
            .compact()
    }

    fun validateRefreshToken(token: String): Boolean {
        return try {
            val claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .payload
            claims["type"] == "REFRESH"
        } catch (ex: Exception) {
            false
        }
    }

    fun getUserIdFromRefreshToken(token: String): Long {
        val claims = Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .payload
        if (claims["type"] != "REFRESH") {
            throw IllegalArgumentException("Not a refresh token")
        }
        return claims.subject.toLong()
    }

    fun generatePasswordResetToken(username: String, email: String): String {
        val now = Date()
        val expiryDate = Date(now.time + 300_000) // 5 minutes

        return Jwts.builder()
            .subject(username)
            .claim("type", "PASSWORD_RESET")
            .claim("email", email)
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(key)
            .compact()
    }

    fun validatePasswordResetToken(token: String, username: String, email: String): Boolean {
        return try {
            val claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .payload
            claims["type"] == "PASSWORD_RESET" &&
                claims.subject == username &&
                claims["email"] == email
        } catch (ex: Exception) {
            false
        }
    }
}
