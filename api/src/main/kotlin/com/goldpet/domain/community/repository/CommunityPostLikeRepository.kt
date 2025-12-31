package com.goldpet.domain.community.repository

import com.goldpet.domain.community.entity.CommunityPost
import com.goldpet.domain.community.entity.CommunityPostLike
import com.goldpet.domain.user.entity.User
import org.springframework.data.jpa.repository.JpaRepository

interface CommunityPostLikeRepository : JpaRepository<CommunityPostLike, Long> {
    fun existsByPostAndUser(post: CommunityPost, user: User): Boolean
    fun findByPostAndUser(post: CommunityPost, user: User): CommunityPostLike?
    fun countByPostId(postId: Long): Long
}

