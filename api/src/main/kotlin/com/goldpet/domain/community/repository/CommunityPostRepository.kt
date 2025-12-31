package com.goldpet.domain.community.repository

import com.goldpet.domain.community.entity.CommunityCategory
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
    
    // Visible posts
    override fun findAll(pageable: Pageable): Page<CommunityPost>
}
