package com.goldpet.config.jwt

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import com.goldpet.config.security.UserPrincipal
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
        val userPrincipal = authentication.principal as UserPrincipal
        
        val now = Date()
        val expiryDate = Date(now.time + jwtExpirationMs)

        return Jwts.builder()
            .subject(userPrincipal.id.toString()) // Use User ID as subject
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(key)
            .compact()
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
}
