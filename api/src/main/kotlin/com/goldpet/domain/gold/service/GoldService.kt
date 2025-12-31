package com.goldpet.domain.gold.service

import com.goldpet.domain.gold.dto.*
import com.goldpet.domain.gold.entity.GoldTransaction
import com.goldpet.domain.gold.entity.TransactionStatus
import com.goldpet.domain.gold.entity.TransactionType
import com.goldpet.domain.gold.repository.GoldTransactionRepository
import com.goldpet.domain.user.repository.UserRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional(readOnly = true)
class GoldService(
    private val transactionRepository: GoldTransactionRepository,
    private val userRepository: UserRepository
) {
    // 상품 목록 (실제로는 DB나 외부 설정에서 관리)
    private val products = listOf(
        GoldProductResponse("gold_10", "골드 10개", 10, 1000, 0),
        GoldProductResponse("gold_50", "골드 50개", 50, 4500, 5),
        GoldProductResponse("gold_100", "골드 100개", 100, 8900, 10),
        GoldProductResponse("gold_300", "골드 300개", 300, 25000, 50),
        GoldProductResponse("gold_500", "골드 500개", 500, 40000, 100)
    )

    fun getBalance(userId: Long): GoldBalanceResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }
        
        val oneMonthAgo = LocalDateTime.now().minusMonths(1)
        val totalCharged = transactionRepository.sumAmountByUserAndTypeSince(userId, TransactionType.CHARGE, oneMonthAgo) ?: 0
        val totalSpent = transactionRepository.sumAmountByUserAndTypeSince(userId, TransactionType.SPEND, oneMonthAgo) ?: 0
        
        return GoldBalanceResponse(
            balance = user.goldBalance,
            totalCharged = totalCharged,
            totalSpent = kotlin.math.abs(totalSpent)
        )
    }

    fun getProducts(): List<GoldProductResponse> = products

    fun getTransactions(userId: Long, pageable: Pageable): Page<TransactionResponse> {
        return transactionRepository.findAllByUserIdOrderByCreatedAtDesc(userId, pageable)
            .map { TransactionResponse.from(it) }
    }

    @Transactional
    fun chargeGold(userId: Long, request: ChargeRequest): TransactionResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }
        
        if (request.amount <= 0) {
            throw IllegalArgumentException("Amount must be positive")
        }
        
        user.goldBalance += request.amount
        userRepository.save(user)
        
        val transaction = GoldTransaction(
            user = user,
            type = TransactionType.CHARGE,
            amount = request.amount,
            balanceAfter = user.goldBalance,
            description = "골드 충전",
            paymentMethod = request.paymentMethod,
            externalTransactionId = request.externalTransactionId,
            status = TransactionStatus.COMPLETED
        )
        
        val saved = transactionRepository.save(transaction)
        return TransactionResponse.from(saved)
    }

    @Transactional
    fun spendGold(userId: Long, request: SpendRequest): TransactionResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }
        
        if (request.amount <= 0) {
            throw IllegalArgumentException("Amount must be positive")
        }
        
        if (user.goldBalance < request.amount) {
            throw IllegalArgumentException("Insufficient gold balance")
        }
        
        user.goldBalance -= request.amount
        userRepository.save(user)
        
        val transaction = GoldTransaction(
            user = user,
            type = TransactionType.SPEND,
            amount = -request.amount,
            balanceAfter = user.goldBalance,
            description = request.description,
            referenceType = request.referenceType,
            referenceId = request.referenceId,
            status = TransactionStatus.COMPLETED
        )
        
        val saved = transactionRepository.save(transaction)
        return TransactionResponse.from(saved)
    }

    @Transactional
    fun grantReward(userId: Long, amount: Int, description: String): TransactionResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }
        
        user.goldBalance += amount
        userRepository.save(user)
        
        val transaction = GoldTransaction(
            user = user,
            type = TransactionType.REWARD,
            amount = amount,
            balanceAfter = user.goldBalance,
            description = description,
            status = TransactionStatus.COMPLETED
        )
        
        val saved = transactionRepository.save(transaction)
        return TransactionResponse.from(saved)
    }
}
