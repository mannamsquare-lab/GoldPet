package com.goldpet.domain.walk.repository

import com.goldpet.domain.walk.entity.Walk
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface WalkRepository : JpaRepository<Walk, Long> {
    fun findByUserIdOrderByStartTimeDesc(userId: Long): List<Walk>
    fun findByUserIdOrderByStartTimeDesc(userId: Long, pageable: org.springframework.data.domain.Pageable): org.springframework.data.domain.Page<Walk>

    @Query(value = "SELECT * FROM walks w WHERE ST_Intersects(w.path, ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326))", nativeQuery = true)
    fun findWalksWithinBoundingBox(
        @Param("minLat") minLat: Double,
        @Param("minLon") minLon: Double,
        @Param("maxLat") maxLat: Double,
        @Param("maxLon") maxLon: Double
    ): List<Walk>

    @Query("""
        SELECT w.user.id, w.user.nickname, MAX(w.user.profileImageUrl),
               SUM(w.distanceKm), COUNT(w)
        FROM Walk w
        WHERE w.startTime >= :since
        GROUP BY w.user.id, w.user.nickname
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

    fun findFirstByUserIdOrderByStartTimeDesc(userId: Long): Walk?

    fun existsByUserIdAndStartTimeBetween(userId: Long, start: java.time.LocalDateTime, end: java.time.LocalDateTime): Boolean

    @Query(value = """
        SELECT
            u.id AS user_id,
            u.nickname,
            u.profile_image_url,
            pet_sub.pet_id,
            pet_sub.pet_name,
            pet_sub.pet_profile_image_url,
            COALESCE(SUM(w.distance_km), 0) AS total_distance_km,
            COALESCE(SUM(w.duration_seconds) / 60, 0) AS total_minutes,
            COALESCE(gold_sub.total_gold, 0) AS total_gold,
            COUNT(w.id) AS walk_count
        FROM walks w
        JOIN users u ON w.user_id = u.id
        LEFT JOIN LATERAL (
            SELECT p.id AS pet_id, p.name AS pet_name, p.profile_image_url AS pet_profile_image_url
            FROM walk_pets wp
            JOIN pets p ON wp.pet_id = p.id
            JOIN walks w2 ON wp.walk_id = w2.id
            WHERE w2.user_id = u.id
              AND w2.start_time >= :startOfMonth
              AND w2.start_time < :startOfNextMonth
            GROUP BY p.id, p.name, p.profile_image_url
            ORDER BY COUNT(*) DESC
            LIMIT 1
        ) pet_sub ON TRUE
        LEFT JOIN LATERAL (
            SELECT COALESCE(SUM(gt.amount), 0) AS total_gold
            FROM gold_transactions gt
            WHERE gt.user_id = u.id
              AND gt.type = 'REWARD'
              AND gt.created_at >= :startOfMonth
              AND gt.created_at < :startOfNextMonth
        ) gold_sub ON TRUE
        WHERE w.start_time >= :startOfMonth
          AND w.start_time < :startOfNextMonth
        GROUP BY u.id, u.nickname, u.profile_image_url,
                 pet_sub.pet_id, pet_sub.pet_name, pet_sub.pet_profile_image_url, gold_sub.total_gold
        ORDER BY total_distance_km DESC
    """, nativeQuery = true)
    fun findCalendarRankings(
        @Param("startOfMonth") startOfMonth: java.time.LocalDateTime,
        @Param("startOfNextMonth") startOfNextMonth: java.time.LocalDateTime,
        pageable: org.springframework.data.domain.Pageable
    ): List<Array<Any>>
}
