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
    private val jwtExpirationMs: Long
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
}
