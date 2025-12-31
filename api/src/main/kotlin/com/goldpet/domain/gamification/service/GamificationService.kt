package com.goldpet.domain.gamification.service

import com.goldpet.domain.gamification.dto.BadgeResponse
import com.goldpet.domain.gamification.dto.ChallengeResponse
import com.goldpet.domain.gamification.dto.UserChallengeProgressResponse
import com.goldpet.domain.gamification.repository.BadgeRepository
import com.goldpet.domain.gamification.repository.ChallengeRepository
import com.goldpet.domain.gamification.repository.UserBadgeRepository
import com.goldpet.domain.gamification.repository.UserChallengeProgressRepository
import com.goldpet.domain.user.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional(readOnly = true)
class GamificationService(
    private val badgeRepository: BadgeRepository,
    private val userBadgeRepository: UserBadgeRepository,
    private val challengeRepository: ChallengeRepository,
    private val progressRepository: UserChallengeProgressRepository,
    private val userRepository: UserRepository
) {

    fun getAllBadges(): List<BadgeResponse> {
        return badgeRepository.findAll().map { 
            BadgeResponse(it.id, it.code, it.name, it.description, it.imageUrl)
        }
    }

    fun getMyBadges(userId: Long): List<BadgeResponse> {
        val user = userRepository.findById(userId).orElseThrow { IllegalArgumentException("User not found") }
        return userBadgeRepository.findAllByUser(user).map {
            BadgeResponse(
                id = it.badge.id,
                code = it.badge.code,
                name = it.badge.name,
                description = it.badge.description,
                imageUrl = it.badge.imageUrl,
                earnedAt = it.createdAt
            )
        }
    }

    fun getActiveChallenges(): List<ChallengeResponse> {
        return challengeRepository.findAllByIsActiveTrueAndEndDateAfter(LocalDateTime.now()).map {
            ChallengeResponse(
                id = it.id,
                title = it.title,
                description = it.description,
                goalType = it.goalType,
                goalValue = it.goalValue,
                rewardGold = it.rewardGold,
                rewardBadgeName = it.rewardBadge?.name,
                startDate = it.startDate,
                endDate = it.endDate,
                isActive = it.isActive
            )
        }
    }

    fun getMyChallengeProgress(userId: Long): List<UserChallengeProgressResponse> {
        val user = userRepository.findById(userId).orElseThrow { IllegalArgumentException("User not found") }
        return progressRepository.findAllByUser(user).map {
            val progressPercent = if (it.challenge.goalValue > 0) {
                (it.currentValue.toDouble() / it.challenge.goalValue * 100).toInt().coerceAtMost(100)
            } else 0

            UserChallengeProgressResponse(
                challengeId = it.challenge.id,
                challengeTitle = it.challenge.title,
                goalValue = it.challenge.goalValue,
                currentValue = it.currentValue,
                progressPercent = progressPercent,
                status = it.status,
                completedAt = it.completedAt
            )
        }
    }
}
