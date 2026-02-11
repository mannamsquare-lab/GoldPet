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

    @Query("""
        SELECT w FROM Walk w JOIN FETCH w.user
        WHERE (:userNickname IS NULL OR w.user.nickname LIKE %:userNickname%)
        AND (:startDate IS NULL OR w.startTime >= :startDate)
        AND (:endDate IS NULL OR w.startTime <= :endDate)
        AND (:minDistance IS NULL OR w.distanceKm >= :minDistance)
        AND (:maxDistance IS NULL OR w.distanceKm <= :maxDistance)
    """,
    countQuery = """
        SELECT COUNT(w) FROM Walk w
        WHERE (:userNickname IS NULL OR w.user.nickname LIKE %:userNickname%)
        AND (:startDate IS NULL OR w.startTime >= :startDate)
        AND (:endDate IS NULL OR w.startTime <= :endDate)
        AND (:minDistance IS NULL OR w.distanceKm >= :minDistance)
        AND (:maxDistance IS NULL OR w.distanceKm <= :maxDistance)
    """)
    fun findAllForAdmin(
        @Param("userNickname") userNickname: String?,
        @Param("startDate") startDate: java.time.LocalDateTime?,
        @Param("endDate") endDate: java.time.LocalDateTime?,
        @Param("minDistance") minDistance: Double?,
        @Param("maxDistance") maxDistance: Double?,
        pageable: org.springframework.data.domain.Pageable
    ): org.springframework.data.domain.Page<Walk>

    fun findAllByStartTimeBetween(
        startTime: java.time.LocalDateTime,
        endTime: java.time.LocalDateTime
    ): List<Walk>

    fun countByStartTimeAfter(since: java.time.LocalDateTime): Long

    @Query("SELECT COALESCE(SUM(w.distanceKm), 0.0) FROM Walk w")
    fun sumTotalDistanceKm(): Double

    @Query("SELECT COALESCE(AVG(w.durationSeconds), 0) FROM Walk w")
    fun avgDurationSeconds(): Double

    @Query(value = "SELECT DATE(start_time) as date, COUNT(*) as cnt FROM walks WHERE start_time >= :since GROUP BY DATE(start_time) ORDER BY date", nativeQuery = true)
    fun countByDateGrouped(@Param("since") since: java.time.LocalDateTime): List<Array<Any>>

    @Query("SELECT COALESCE(SUM(w.distanceKm), 0.0) FROM Walk w WHERE w.user.id = :userId")
    fun sumDistanceByUserId(@Param("userId") userId: Long): Double

    @Query("SELECT COALESCE(SUM(w.durationSeconds), 0) FROM Walk w WHERE w.user.id = :userId")
    fun sumDurationByUserId(@Param("userId") userId: Long): Long

    @Query("SELECT COALESCE(SUM(w.caloriesBurned), 0.0) FROM Walk w WHERE w.user.id = :userId")
    fun sumCaloriesByUserId(@Param("userId") userId: Long): Double

    fun countByUserId(userId: Long): Long
}
