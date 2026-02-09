package com.goldpet.domain.walk.repository

import com.goldpet.domain.walk.entity.Walk
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface WalkRepository : JpaRepository<Walk, Long> {
    fun findByUserId(userId: Long): List<Walk>

    @Query(value = "SELECT * FROM walks w WHERE ST_Intersects(w.path, ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326))", nativeQuery = true)
    fun findWalksWithinBoundingBox(
        @Param("minLat") minLat: Double,
        @Param("minLon") minLon: Double,
        @Param("maxLat") maxLat: Double,
        @Param("maxLon") maxLon: Double
    ): List<Walk>

    @Query("""
        SELECT w.user.id, w.user.nickname, w.user.profileImageUrl,
               SUM(w.distanceKm), COUNT(w)
        FROM Walk w
        WHERE w.startTime >= :since
        GROUP BY w.user.id, w.user.nickname, w.user.profileImageUrl
        ORDER BY SUM(w.distanceKm) DESC
    """)
    fun findRankingsSince(
        @Param("since") since: java.time.LocalDateTime,
        pageable: org.springframework.data.domain.Pageable
    ): List<Array<Any>>
}
