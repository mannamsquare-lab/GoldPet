package com.goldpet.domain.gamification.repository

import com.goldpet.domain.gamification.entity.Challenge
import com.goldpet.domain.gamification.entity.UserChallengeProgress
import com.goldpet.domain.user.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional

interface UserChallengeProgressRepository : JpaRepository<UserChallengeProgress, Long> {
    fun findAllByUser(user: User): List<UserChallengeProgress>
    fun findByUserAndChallenge(user: User, challenge: Challenge): Optional<UserChallengeProgress>
}
