package com.goldpet.domain.gamification.repository

import com.goldpet.domain.gamification.entity.Badge
import org.springframework.data.jpa.repository.JpaRepository

interface BadgeRepository : JpaRepository<Badge, Long> {
    fun findByCode(code: String): Badge?
}
