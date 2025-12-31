package com.goldpet.domain.user.repository

import com.goldpet.domain.user.entity.User
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDateTime
import java.util.Optional

interface UserRepository : JpaRepository<User, Long> {
    fun findByOauthProviderAndOauthId(oauthProvider: String, oauthId: String): Optional<User>
    fun findByUsername(username: String): Optional<User>
    fun findByEmail(email: String): Optional<User>

    fun findByNickname(nickname: String): Optional<User>
    
    // Admin methods
    fun findByNicknameContainingIgnoreCase(nickname: String, pageable: Pageable): Page<User>
    fun countByCreatedAtAfter(date: LocalDateTime): Long

    @Query(value = "SELECT * FROM users u WHERE ST_Intersects(u.main_location_geom, ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326))", nativeQuery = true)
    fun findUsersWithinBoundingBox(
        @Param("minLat") minLat: Double,
        @Param("minLon") minLon: Double,
        @Param("maxLat") maxLat: Double,
        @Param("maxLon") maxLon: Double
    ): List<User>
}

