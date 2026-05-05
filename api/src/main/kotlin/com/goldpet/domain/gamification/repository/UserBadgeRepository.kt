package com.goldpet.domain.gamification.repository

import com.goldpet.domain.gamification.entity.Badge
import com.goldpet.domain.gamification.entity.UserBadge
import com.goldpet.domain.user.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface UserBadgeRepository : JpaRepository<UserBadge, Long> {
    fun findAllByUser(user: User): List<UserBadge>
    fun existsByUserAndBadge(user: User, badge: Badge): Boolean
    fun existsByUserAndBadgeAndCycleKey(user: User, badge: Badge, cycleKey: String?): Boolean
    fun findByUserAndBadgeAndCycleKey(user: User, badge: Badge, cycleKey: String?): UserBadge?
    fun countByBadgeId(badgeId: Long): Long

    @Query(
        "SELECT badge_id AS badgeId, COUNT(*) AS earnedCount FROM user_badges GROUP BY badge_id",
        nativeQuery = true
    )
    fun findBadgeIdEarnedCounts(): List<BadgeIdEarnedCount>
}

interface BadgeIdEarnedCount {
    fun getBadgeId(): Long
    fun getEarnedCount(): Long
}
