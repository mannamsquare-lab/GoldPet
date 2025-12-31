package com.goldpet.domain.aiprofile.repository

import com.goldpet.domain.aiprofile.entity.AIProfileRequest
import com.goldpet.domain.aiprofile.entity.AIRequestStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository

interface AIProfileRequestRepository : JpaRepository<AIProfileRequest, Long> {
    fun findAllByUserIdOrderByCreatedAtDesc(userId: Long, pageable: Pageable): Page<AIProfileRequest>
    fun findAllByPetIdOrderByCreatedAtDesc(petId: Long, pageable: Pageable): Page<AIProfileRequest>
    fun findAllByStatus(status: AIRequestStatus): List<AIProfileRequest>
    fun countByUserIdAndStatus(userId: Long, status: AIRequestStatus): Long
}
