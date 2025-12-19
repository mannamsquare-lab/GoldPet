package com.goldpet.domain.friend.repository

import com.goldpet.domain.friend.entity.Like
import com.goldpet.domain.user.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional

interface LikeRepository : JpaRepository<Like, Long> {
    fun findByFromUserAndToUser(fromUser: User, toUser: User): Optional<Like>
}
