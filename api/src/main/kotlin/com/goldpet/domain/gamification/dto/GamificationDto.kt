package com.goldpet.domain.gamification.dto

import com.goldpet.domain.gamification.entity.Badge
import com.goldpet.domain.gamification.entity.Challenge
import com.goldpet.domain.gamification.entity.UserBadge
import com.goldpet.domain.gamification.entity.UserChallengeProgress
import java.time.LocalDateTime

data class BadgeResponse(
    val id: Long,
    val code: String,
    val name: String,
    val description: String,
    val imageUrl: String,
    val acquiredAt: LocalDateTime? = null
) {
    companion object {
        fun from(badge: Badge): BadgeResponse {
            return BadgeResponse(
                id = badge.id,
                code = badge.code,
                name = badge.name,
                description = badge.description,
                imageUrl = badge.imageUrl
            )
        }

        fun from(userBadge: UserBadge): BadgeResponse {
            return BadgeResponse(
                id = userBadge.badge.id,
                code = userBadge.badge.code,
                name = userBadge.badge.name,
                description = userBadge.badge.description,
                imageUrl = userBadge.badge.imageUrl,
                acquiredAt = userBadge.createdAt
            )
        }
    }
}

data class ChallengeResponse(
    val id: Long,
    val title: String,
    val description: String,
    val goalType: String,
    val goalValue: Int,
    val rewardGold: Int?,
    val rewardBadge: BadgeResponse?,
    val startDate: LocalDateTime,
    val endDate: LocalDateTime,
    val progress: ChallengeProgressDto?
) {
    companion object {
        fun from(challenge: Challenge, progress: UserChallengeProgress?): ChallengeResponse {
            return ChallengeResponse(
                id = challenge.id,
                title = challenge.title,
                description = challenge.description,
                goalType = challenge.goalType.name,
                goalValue = challenge.goalValue,
                rewardGold = challenge.rewardGold,
                rewardBadge = challenge.rewardBadge?.let { BadgeResponse.from(it) },
                startDate = challenge.startDate,
                endDate = challenge.endDate,
                progress = progress?.let {
                    ChallengeProgressDto(
                        currentValue = it.currentValue,
                        status = it.status.name,
                        completedAt = it.completedAt
                    )
                }
            )
        }
    }
}

data class ChallengeProgressDto(
    val currentValue: Int,
    val status: String,
    val completedAt: LocalDateTime?
)
