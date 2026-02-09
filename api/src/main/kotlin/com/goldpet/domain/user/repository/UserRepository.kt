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

    @Query(value = "SELECT * FROM users u WHERE u.main_location_geom IS NOT NULL AND ST_DistanceSphere(u.main_location_geom, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)) <= :radius", nativeQuery = true)
    fun findUsersWithinRadius(
        @Param("lat") lat: Double,
        @Param("lon") lon: Double,
        @Param("radius") radius: Double
    ): List<User>

    @Query("SELECT COALESCE(SUM(u.goldBalance), 0) FROM User u")
    fun sumGoldBalance(): Long

    @Query(value = "SELECT DATE(created_at) as date, COUNT(*) as cnt FROM users WHERE created_at >= :since GROUP BY DATE(created_at) ORDER BY date", nativeQuery = true)
    fun countByDateGrouped(@Param("since") since: LocalDateTime): List<Array<Any>>
}

