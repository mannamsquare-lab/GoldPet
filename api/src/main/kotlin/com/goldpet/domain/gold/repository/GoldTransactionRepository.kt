package com.goldpet.domain.gold.repository

import com.goldpet.domain.gold.entity.GoldTransaction
import com.goldpet.domain.gold.entity.TransactionType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDateTime

interface GoldTransactionRepository : JpaRepository<GoldTransaction, Long> {
    fun findAllByUserIdOrderByCreatedAtDesc(userId: Long, pageable: Pageable): Page<GoldTransaction>
    
    @Query("SELECT SUM(t.amount) FROM GoldTransaction t WHERE t.user.id = :userId AND t.type = :type AND t.createdAt >= :since")
    fun sumAmountByUserAndTypeSince(
        @Param("userId") userId: Long, 
        @Param("type") type: TransactionType,
        @Param("since") since: LocalDateTime
    ): Int?
}
