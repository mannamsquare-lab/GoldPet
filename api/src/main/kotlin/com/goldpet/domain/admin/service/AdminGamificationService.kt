package com.goldpet.domain.admin.service

import com.goldpet.domain.admin.controller.*
import com.goldpet.domain.gamification.entity.Badge
import com.goldpet.domain.gamification.entity.Challenge
import com.goldpet.domain.gamification.entity.UserChallengeProgress
import com.goldpet.domain.gamification.repository.BadgeRepository
import com.goldpet.domain.gamification.repository.ChallengeRepository
import com.goldpet.domain.gamification.repository.UserBadgeRepository
import com.goldpet.domain.gamification.repository.UserChallengeProgressRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Service
class AdminGamificationService(
    private val badgeRepository: BadgeRepository,
    private val userBadgeRepository: UserBadgeRepository,
    private val challengeRepository: ChallengeRepository,
    private val userChallengeProgressRepository: UserChallengeProgressRepository
) {
    private val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")

    fun getBadges(): List<BadgeAdminResponse> {
        return badgeRepository.findAll().map { badge ->
            val earnedCount = userBadgeRepository.findAll().count { it.badge.id == badge.id }
            BadgeAdminResponse(
                id = badge.id,
                code = badge.code,
                name = badge.name,
                description = badge.description,
                imageUrl = badge.imageUrl,
                earnedCount = earnedCount
            )
        }
    }

    @Transactional
    fun createBadge(request: CreateBadgeRequest): BadgeAdminResponse {
        val badge = Badge(
            code = request.code,
            name = request.name,
            description = request.description,
            imageUrl = request.imageUrl ?: ""
        )
        val saved = badgeRepository.save(badge)
        return BadgeAdminResponse(
            id = saved.id,
            code = saved.code,
            name = saved.name,
            description = saved.description,
            imageUrl = saved.imageUrl,
            earnedCount = 0
        )
    }

    fun getChallenges(): List<ChallengeAdminResponse> {
        return challengeRepository.findAll().map { challenge ->
            val progressList = userChallengeProgressRepository.findAll().filter { it.challenge.id == challenge.id }
            ChallengeAdminResponse(
                id = challenge.id,
                title = challenge.title,
                description = challenge.description,
                goalType = challenge.goalType.name,
                goalValue = challenge.goalValue,
                startDate = challenge.startDate.format(dateFormatter),
                endDate = challenge.endDate.format(dateFormatter),
                participantCount = progressList.size,
                completedCount = progressList.count { it.status == UserChallengeProgress.Status.COMPLETED }
            )
        }
    }

    @Transactional
    fun createChallenge(request: CreateChallengeRequest): ChallengeAdminResponse {
        val goalType = Challenge.GoalType.valueOf(request.goalType)
        val challenge = Challenge(
            title = request.title,
            description = request.description,
            goalType = goalType,
            goalValue = request.goalValue,
            startDate = LocalDate.parse(request.startDate).atStartOfDay(),
            endDate = LocalDate.parse(request.endDate).atTime(23, 59, 59),
            isActive = true
        )
        val saved = challengeRepository.save(challenge)
        return ChallengeAdminResponse(
            id = saved.id,
            title = saved.title,
            description = saved.description,
            goalType = saved.goalType.name,
            goalValue = saved.goalValue,
            startDate = saved.startDate.format(dateFormatter),
            endDate = saved.endDate.format(dateFormatter),
            participantCount = 0,
            completedCount = 0
        )
    }
}
