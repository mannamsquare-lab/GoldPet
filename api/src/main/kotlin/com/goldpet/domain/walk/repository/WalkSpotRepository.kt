package com.goldpet.domain.walk.repository

import com.goldpet.domain.walk.entity.WalkSpot
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDateTime

interface WalkSpotRepository : JpaRepository<WalkSpot, Long> {

    @Query("""
        SELECT ws FROM WalkSpot ws
        JOIN FETCH ws.walk w
        WHERE w.user.id = :userId
        AND ws.type = com.goldpet.domain.walk.entity.WalkSpotType.PHOTO
        AND ws.imageUrl IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM com.goldpet.domain.walk.entity.StoolAnalysis sa
            WHERE sa.imageUrl = ws.imageUrl
        )
        ORDER BY ws.timestamp DESC
    """)
    fun findPhotoSpotsByUserId(
        @Param("userId") userId: Long,
        pageable: Pageable
    ): Page<WalkSpot>

    @Query("""
        SELECT ws FROM WalkSpot ws
        JOIN FETCH ws.walk w
        WHERE w.user.id = :userId
        AND ws.type = com.goldpet.domain.walk.entity.WalkSpotType.PHOTO
        AND ws.imageUrl IS NOT NULL
        AND ws.timestamp >= :start AND ws.timestamp < :end
        AND NOT EXISTS (
            SELECT 1 FROM com.goldpet.domain.walk.entity.StoolAnalysis sa
            WHERE sa.imageUrl = ws.imageUrl
        )
        ORDER BY ws.timestamp DESC
    """)
    fun findPhotoSpotsByUserIdAndMonth(
        @Param("userId") userId: Long,
        @Param("start") start: LocalDateTime,
        @Param("end") end: LocalDateTime,
        pageable: Pageable
    ): Page<WalkSpot>

    @Query("""
        SELECT ws FROM WalkSpot ws
        JOIN FETCH ws.walk w
        WHERE w.isPublic = true
        AND ws.type = com.goldpet.domain.walk.entity.WalkSpotType.PHOTO
        AND ws.imageUrl IS NOT NULL
        AND w.user.id NOT IN :blockedUserIds
        AND NOT EXISTS (
            SELECT 1 FROM com.goldpet.domain.walk.entity.StoolAnalysis sa
            WHERE sa.imageUrl = ws.imageUrl
        )
        ORDER BY ws.timestamp DESC
    """)
    fun findPublicPhotoSpots(
        @Param("blockedUserIds") blockedUserIds: List<Long>,
        pageable: Pageable
    ): Page<WalkSpot>
}
