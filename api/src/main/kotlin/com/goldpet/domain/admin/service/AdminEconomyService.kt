package com.goldpet.domain.admin.service

import com.goldpet.domain.admin.controller.EconomyStatsResponse
import com.goldpet.domain.admin.controller.GoldAdjustRequest
import com.goldpet.domain.admin.controller.TransactionAdminResponse
import com.goldpet.domain.user.repository.UserRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.format.DateTimeFormatter

@Service
class AdminEconomyService(
    private val userRepository: UserRepository
) {
    private val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")

    fun getStats(): EconomyStatsResponse {
        val totalGold = userRepository.findAll().sumOf { it.goldBalance }
        
        return EconomyStatsResponse(
            totalGoldCirculation = totalGold.toLong(),
            totalRevenue = 24500000L, // Mock - would come from payment table
            todayRevenue = 350000L,   // Mock
            activeSubscriptions = 156, // Mock
            pendingPayouts = 5         // Mock
        )
    }

    fun getTransactions(type: String?, pageable: Pageable): Page<TransactionAdminResponse> {
        // Mock transactions - would come from gold_transactions table
        val transactions = listOf(
            TransactionAdminResponse(1, 1, "멍멍이맘", "PURCHASE", 10000, "Gold 100개 구매", "2025-12-21 14:30"),
            TransactionAdminResponse(2, 2, "고양이집사", "SPEND", -50, "AI 프로필 생성", "2025-12-21 13:00"),
            TransactionAdminResponse(3, 3, "산책러버", "EARN", 10, "챌린지 완료 보상", "2025-12-21 12:00")
        )
        return PageImpl(transactions, pageable, transactions.size.toLong())
    }

    @Transactional
    fun adjustGold(request: GoldAdjustRequest) {
        val user = userRepository.findById(request.userId)
            .orElseThrow { NoSuchElementException("User not found: ${request.userId}") }
        
        val currentBalance = user.goldBalance
        user.goldBalance = currentBalance + request.amount
        userRepository.save(user)
        
        // TODO: Log transaction to gold_transactions table
    }
}
