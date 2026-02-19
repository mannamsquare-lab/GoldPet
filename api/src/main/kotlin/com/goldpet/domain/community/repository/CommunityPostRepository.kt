package com.goldpet.domain.community.repository

import com.goldpet.domain.community.entity.CommunityCategory
import com.goldpet.domain.community.entity.CommunityComment
import com.goldpet.domain.community.entity.CommunityPost
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface CommunityPostRepository : JpaRepository<CommunityPost, Long> {
    fun findAllByCategory(category: CommunityCategory, pageable: Pageable): Page<CommunityPost>
    fun countByCategory(category: CommunityCategory): Long

    // Search methods
    fun findByTitleContainingIgnoreCase(title: String, pageable: Pageable): Page<CommunityPost>

    @Query("SELECT p FROM CommunityPost p WHERE p.title LIKE %:keyword% OR p.content LIKE %:keyword%")
    fun searchByKeyword(@Param("keyword") keyword: String, pageable: Pageable): Page<CommunityPost>

    // User post count
    fun countByUserId(userId: Long): Long

    // Adopted comment lookup
    fun findByAdoptedComment(adoptedComment: CommunityComment): CommunityPost?

    // User's posts
    fun findByUserIdOrderByCreatedAtDesc(userId: Long, pageable: Pageable): Page<CommunityPost>
    fun findAllByUserId(userId: Long): List<CommunityPost>

    // Visible posts
    override fun findAll(pageable: Pageable): Page<CommunityPost>

    // Block-filtered queries
    @Query("SELECT p FROM CommunityPost p WHERE p.category = :category AND p.user.id NOT IN :blockedUserIds")
    fun findAllByCategoryExcludingUsers(
        @Param("category") category: CommunityCategory,
        @Param("blockedUserIds") blockedUserIds: List<Long>,
        pageable: Pageable
    ): Page<CommunityPost>

    @Query("SELECT p FROM CommunityPost p WHERE p.user.id NOT IN :blockedUserIds")
    fun findAllExcludingUsers(
        @Param("blockedUserIds") blockedUserIds: List<Long>,
        pageable: Pageable
    ): Page<CommunityPost>

    @Query("SELECT p FROM CommunityPost p WHERE (p.title LIKE %:keyword% OR p.content LIKE %:keyword%) AND p.user.id NOT IN :blockedUserIds")
    fun searchByKeywordExcludingUsers(
        @Param("keyword") keyword: String,
        @Param("blockedUserIds") blockedUserIds: List<Long>,
        pageable: Pageable
    ): Page<CommunityPost>
}
