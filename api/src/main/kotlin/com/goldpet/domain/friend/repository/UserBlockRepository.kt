package com.goldpet.domain.friend.repository

import com.goldpet.domain.friend.entity.UserBlock
import com.goldpet.domain.user.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional

interface UserBlockRepository : JpaRepository<UserBlock, Long> {
    fun findByBlockerAndBlocked(blocker: User, blocked: User): Optional<UserBlock>
    fun findAllByBlocker(blocker: User): List<UserBlock>
    fun existsByBlockerAndBlocked(blocker: User, blocked: User): Boolean
}
