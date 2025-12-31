package com.goldpet.domain.gamification.repository

import com.goldpet.domain.gamification.entity.Badge
import com.goldpet.domain.gamification.entity.UserBadge
import com.goldpet.domain.user.entity.User
import org.springframework.data.jpa.repository.JpaRepository

interface UserBadgeRepository : JpaRepository<UserBadge, Long> {
    fun findAllByUser(user: User): List<UserBadge>
    fun existsByUserAndBadge(user: User, badge: Badge): Boolean
}
