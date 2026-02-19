package com.goldpet.domain.gamification.service

import com.goldpet.domain.checkin.repository.CheckInRepository
import com.goldpet.domain.community.repository.CommunityCommentRepository
import com.goldpet.domain.community.repository.CommunityPostRepository
import com.goldpet.domain.friend.repository.MatchRepository
import com.goldpet.domain.gamification.entity.Badge
import com.goldpet.domain.gamification.entity.BadgeConditionType
import com.goldpet.domain.gamification.entity.UserBadge
import com.goldpet.domain.gamification.repository.BadgeRepository
import com.goldpet.domain.gamification.repository.UserBadgeRepository
import com.goldpet.domain.gold.entity.GoldTransaction
import com.goldpet.domain.gold.entity.TransactionType
import com.goldpet.domain.gold.repository.GoldTransactionRepository
import com.goldpet.domain.pet.repository.PetRepository
import com.goldpet.domain.user.repository.UserRepository
import com.goldpet.domain.walk.repository.WalkRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.time.temporal.WeekFields

@Service
class BadgeAwardService(
    private val badgeRepository: BadgeRepository,
    private val userBadgeRepository: UserBadgeRepository,
    private val userRepository: UserRepository,
    private val petRepository: PetRepository,
    private val walkRepository: WalkRepository,
    private val communityPostRepository: CommunityPostRepository,
    private val communityCommentRepository: CommunityCommentRepository,
    private val checkInRepository: CheckInRepository,
    private val matchRepository: MatchRepository,
    private val goldTransactionRepository: GoldTransactionRepository
) {
    private val log = LoggerFactory.getLogger(BadgeAwardService::class.java)

    fun checkAndAwardBadges(userId: Long, triggerType: BadgeConditionType): List<Badge> {
        val user = userRepository.findById(userId).orElse(null) ?: return emptyList()
        val candidates = badgeRepository.findAllByConditionTypeAndIsActiveTrue(triggerType)
        if (candidates.isEmpty()) return emptyList()

        val now = LocalDateTime.now()
        val currentValue = getCurrentValue(userId, triggerType)
        val awarded = mutableListOf<Badge>()

        for (badge in candidates) {
            val conditionValue = badge.conditionValue ?: continue

            // Period check: skip if badge has date range and current time is outside
            if (badge.startDate != null && now.isBefore(badge.startDate)) continue
            if (badge.endDate != null && now.isAfter(badge.endDate)) continue

            val cycleKey = if (badge.isRepeatable) getCycleKey(badge.repeatCycle, now) else null

            // Check if already awarded (for this cycle if repeatable)
            if (badge.isRepeatable) {
                if (userBadgeRepository.existsByUserAndBadgeAndCycleKey(user, badge, cycleKey)) continue
            } else {
                if (userBadgeRepository.existsByUserAndBadge(user, badge)) continue
            }

            if (currentValue >= conditionValue) {
                val userBadge = UserBadge(
                    user = user,
                    badge = badge,
                    currentValue = currentValue.toInt(),
                    cycleKey = cycleKey
                )
                userBadgeRepository.save(userBadge)
                awarded.add(badge)
                log.info("Badge awarded: userId={}, badge={} (id={}), cycleKey={}", userId, badge.name, badge.id, cycleKey)

                // Give reward gold
                if (badge.rewardGold != null && badge.rewardGold!! > 0) {
                    user.goldBalance += badge.rewardGold!!
                    goldTransactionRepository.save(
                        GoldTransaction(
                            user = user,
                            type = TransactionType.REWARD,
                            amount = badge.rewardGold!!,
                            balanceAfter = user.goldBalance,
                            description = "뱃지 획득 보상: ${badge.name}"
                        )
                    )
                    userRepository.save(user)
                    userBadge.rewardGoldGiven = badge.rewardGold!!
                    userBadgeRepository.save(userBadge)
                }
            }
        }
        return awarded
    }

    private fun getCurrentValue(userId: Long, type: BadgeConditionType): Long {
        return when (type) {
            BadgeConditionType.PET_REGISTER -> petRepository.countByOwnerId(userId)
            BadgeConditionType.WALK_COUNT -> walkRepository.countByUserId(userId)
            BadgeConditionType.WALK_DISTANCE_TOTAL -> walkRepository.sumDistanceByUserId(userId).toLong()
            BadgeConditionType.COMMUNITY_POST -> communityPostRepository.countByUserId(userId)
            BadgeConditionType.COMMUNITY_COMMENT -> communityCommentRepository.countByUserId(userId)
            BadgeConditionType.CHECK_IN -> checkInRepository.countByUserId(userId)
            BadgeConditionType.FRIEND_MATCH -> matchRepository.countByUserId(userId)
        }
    }

    private fun getCycleKey(repeatCycle: String?, now: LocalDateTime): String? {
        return when (repeatCycle) {
            "DAILY" -> now.toLocalDate().toString() // "2026-02-18"
            "WEEKLY" -> {
                val weekFields = WeekFields.ISO
                val week = now.get(weekFields.weekOfWeekBasedYear())
                "${now.year}-W${week.toString().padStart(2, '0')}" // "2026-W08"
            }
            "MONTHLY" -> "${now.year}-${now.monthValue.toString().padStart(2, '0')}" // "2026-02"
            else -> null
        }
    }
}
