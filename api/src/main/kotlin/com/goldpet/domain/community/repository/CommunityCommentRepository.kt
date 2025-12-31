package com.goldpet.domain.community.repository

import com.goldpet.domain.community.entity.CommunityComment
import com.goldpet.domain.community.entity.CommunityPost
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository

interface CommunityCommentRepository : JpaRepository<CommunityComment, Long> {
    fun findAllByPost(post: CommunityPost, pageable: Pageable): Page<CommunityComment>
    
    // Admin methods
    fun findByPostIdOrderByCreatedAtAsc(postId: Long): List<CommunityComment>
    fun existsByPostAndUser(post: CommunityPost, user: com.goldpet.domain.user.entity.User): Boolean
    fun existsByPostIdAndUserId(postId: Long, userId: Long): Boolean
    fun existsByParentCommentIdAndUserId(parentCommentId: Long, userId: Long): Boolean
    fun countByPostId(postId: Long): Long
    fun countByUserId(userId: Long): Long
}

