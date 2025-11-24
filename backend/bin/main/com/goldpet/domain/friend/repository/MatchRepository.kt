package com.goldpet.domain.friend.repository

import com.goldpet.domain.friend.entity.Match
import com.goldpet.domain.user.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional

interface MatchRepository : JpaRepository<Match, Long> {
    fun findByUser1AndUser2(user1: User, user2: User): Optional<Match>
}
