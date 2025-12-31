package com.goldpet.domain.gamification.repository

import com.goldpet.domain.gamification.entity.Challenge
import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDateTime

interface ChallengeRepository : JpaRepository<Challenge, Long> {
    fun findAllByIsActiveTrueAndEndDateAfter(now: LocalDateTime): List<Challenge>
}
