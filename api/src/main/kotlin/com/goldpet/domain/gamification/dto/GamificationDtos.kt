package com.goldpet.domain.gamification.dto

import com.goldpet.domain.gamification.entity.Challenge
import com.goldpet.domain.gamification.entity.UserChallengeProgress
import java.time.LocalDateTime

data class BadgeResponse(
    val id: Long,
    val code: String,
    val name: String,
    val description: String,
    val imageUrl: String,
    val earnedAt: LocalDateTime? = null
)

data class ChallengeResponse(
    val id: Long,
    val title: String,
    val description: String,
    val goalType: Challenge.GoalType,
    val goalValue: Int,
    val rewardGold: Int?,
    val rewardBadgeName: String?,
    val startDate: LocalDateTime,
    val endDate: LocalDateTime,
    val isActive: Boolean
)

data class UserChallengeProgressResponse(
    val challengeId: Long,
    val challengeTitle: String,
    val goalValue: Int,
    val currentValue: Int,
    val progressPercent: Int,
    val status: UserChallengeProgress.Status,
    val completedAt: LocalDateTime?
)
