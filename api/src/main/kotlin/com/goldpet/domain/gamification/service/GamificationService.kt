package com.goldpet.domain.gamification.service

import com.goldpet.domain.gamification.dto.BadgeResponse
import com.goldpet.domain.gamification.dto.ChallengeResponse
import com.goldpet.domain.gamification.entity.Challenge
import com.goldpet.domain.gamification.entity.UserBadge
import com.goldpet.domain.gamification.entity.UserChallengeProgress
import com.goldpet.domain.gamification.repository.BadgeRepository
import com.goldpet.domain.gamification.repository.ChallengeRepository
import com.goldpet.domain.gamification.repository.UserBadgeRepository
import com.goldpet.domain.gamification.repository.UserChallengeProgressRepository
import com.goldpet.domain.gold.entity.GoldTransaction
import com.goldpet.domain.gold.entity.TransactionType
import com.goldpet.domain.gold.repository.GoldTransactionRepository
import com.goldpet.domain.user.entity.User
import com.goldpet.domain.user.repository.UserRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional(readOnly = true)
class GamificationService(
    private val userRepository: UserRepository,
    private val badgeRepository: BadgeRepository,
    private val userBadgeRepository: UserBadgeRepository,
    private val challengeRepository: ChallengeRepository,
    private val userChallengeProgressRepository: UserChallengeProgressRepository,
    private val goldTransactionRepository: GoldTransactionRepository
) {

    fun getMyBadges(userId: Long): List<BadgeResponse> {
        val user = getUser(userId)
        val userBadges = userBadgeRepository.findAllByUser(user)
        return userBadges.map { BadgeResponse.from(it) }
    }

    fun getMyChallenges(userId: Long): List<ChallengeResponse> {
        val user = getUser(userId)
        val activeChallenges = challengeRepository.findAllByIsActiveTrueAndEndDateAfter(LocalDateTime.now())

        return activeChallenges.map { challenge ->
            val progress = userChallengeProgressRepository.findByUserAndChallenge(user, challenge).orElse(null)
            ChallengeResponse.from(challenge, progress)
        }
    }

    @Transactional
    fun updateChallengeProgress(userId: Long, goalType: Challenge.GoalType, amount: Int) {
        val user = getUser(userId)
        val activeChallenges = challengeRepository.findAllByIsActiveTrueAndEndDateAfter(LocalDateTime.now())
            .filter { it.goalType == goalType }

        activeChallenges.forEach { challenge ->
            val progress = userChallengeProgressRepository.findByUserAndChallenge(user, challenge)
                .orElseGet {
                    userChallengeProgressRepository.save(
                        UserChallengeProgress(
                            user = user,
                            challenge = challenge,
                            status = UserChallengeProgress.Status.IN_PROGRESS
                        )
                    )
                }

            if (progress.status == UserChallengeProgress.Status.IN_PROGRESS) {
                progress.currentValue += amount
                
                // Check completion
                if (progress.currentValue >= challenge.goalValue) {
                    progress.status = UserChallengeProgress.Status.COMPLETED
                    progress.completedAt = LocalDateTime.now()
                    giveReward(user, challenge)
                }
                userChallengeProgressRepository.save(progress)
            }
        }

        // Basic Badge Logic: First Walk
        if (goalType == Challenge.GoalType.WALK_DISTANCE_TOTAL) {
            checkFirstWalkBadge(user)
        }
    }

    private fun giveReward(user: User, challenge: Challenge) {
        // Give Gold
        if(challenge.rewardGold != null && challenge.rewardGold > 0) {
            user.goldBalance += challenge.rewardGold
            goldTransactionRepository.save(GoldTransaction(
                user = user,
                type = TransactionType.REWARD,
                amount = challenge.rewardGold,
                balanceAfter = user.goldBalance,
                description = "챌린지 완료 보상: ${challenge.title}"
            ))
            userRepository.save(user)
        }

        // Give Badge
        challenge.rewardBadge?.let { badge ->
            if (!userBadgeRepository.existsByUserAndBadge(user, badge)) {
                userBadgeRepository.save(UserBadge(user = user, badge = badge))
            }
        }
    }

    private fun checkFirstWalkBadge(user: User) {
        val badgeCode = "FIRST_WALK"
        val badge = badgeRepository.findByCode(badgeCode) ?: return

        if (!userBadgeRepository.existsByUserAndBadge(user, badge)) {
            userBadgeRepository.save(UserBadge(user = user, badge = badge))
        }
    }

    private fun getUser(userId: Long): User {
        return userRepository.findById(userId).orElseThrow { EntityNotFoundException("User not found") }
    }
}
