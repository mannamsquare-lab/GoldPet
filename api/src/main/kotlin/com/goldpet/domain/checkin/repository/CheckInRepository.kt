package com.goldpet.domain.checkin.repository

import com.goldpet.domain.checkin.entity.CheckIn
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDateTime

interface CheckInRepository : JpaRepository<CheckIn, Long> {
    fun findAllByUserIdOrderByCreatedAtDesc(userId: Long, pageable: Pageable): Page<CheckIn>
    fun findAllByPlaceIdOrderByCreatedAtDesc(placeId: Long, pageable: Pageable): Page<CheckIn>
    fun countByUserIdAndCreatedAtAfter(userId: Long, after: LocalDateTime): Long
    fun existsByUserIdAndPlaceIdAndCreatedAtAfter(userId: Long, placeId: Long, after: LocalDateTime): Boolean
}
