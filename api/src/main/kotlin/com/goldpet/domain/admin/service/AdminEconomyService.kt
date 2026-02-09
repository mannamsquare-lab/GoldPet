package com.goldpet.domain.admin.service

import com.goldpet.domain.admin.controller.EconomyStatsResponse
import com.goldpet.domain.admin.controller.GoldAdjustRequest
import com.goldpet.domain.admin.controller.TransactionAdminResponse
import com.goldpet.domain.gold.entity.GoldTransaction
import com.goldpet.domain.gold.entity.TransactionType
import com.goldpet.domain.gold.repository.GoldTransactionRepository
import com.goldpet.domain.user.repository.UserRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Service
class AdminEconomyService(
    private val userRepository: UserRepository,
    private val goldTransactionRepository: GoldTransactionRepository
) {
    private val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")

    fun getStats(): EconomyStatsResponse {
        val totalGold = userRepository.findAll().sumOf { it.goldBalance }
        val today = LocalDate.now().atStartOfDay()

        return EconomyStatsResponse(
            totalGoldCirculation = totalGold.toLong(),
            totalRevenue = goldTransactionRepository.sumAmountByType(TransactionType.CHARGE),
            todayRevenue = goldTransactionRepository.sumAmountByTypeSince(TransactionType.CHARGE, today),
            activeSubscriptions = 0, // 구독 기능 미구현
            pendingPayouts = 0 // 정산 기능 미구현
        )
    }

    fun getTransactions(type: String?, pageable: Pageable): Page<TransactionAdminResponse> {
        val transactionType = type?.let {
            try { TransactionType.valueOf(it) } catch (e: Exception) { null }
        }
        return goldTransactionRepository.findAllForAdmin(transactionType, pageable).map { t ->
            TransactionAdminResponse(
                id = t.id,
                userId = t.user.id,
                userNickname = t.user.nickname ?: "사용자",
                type = t.type.name,
                amount = t.amount,
                description = t.description ?: "",
                createdAt = t.createdAt.format(formatter)
            )
        }
    }

    @Transactional
    fun adjustGold(request: GoldAdjustRequest) {
        val user = userRepository.findById(request.userId)
            .orElseThrow { NoSuchElementException("User not found: ${request.userId}") }

        val currentBalance = user.goldBalance
        user.goldBalance = currentBalance + request.amount
        userRepository.save(user)

        goldTransactionRepository.save(GoldTransaction(
            user = user,
            type = if (request.amount > 0) TransactionType.CHARGE else TransactionType.SPEND,
            amount = request.amount,
            balanceAfter = user.goldBalance,
            description = request.reason
        ))
    }
}
