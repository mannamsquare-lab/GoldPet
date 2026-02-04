package com.goldpet.domain.gold.service

import com.goldpet.domain.gold.dto.ChargeRequest
import com.goldpet.domain.gold.dto.SpendRequest
import com.goldpet.domain.gold.entity.GoldTransaction
import com.goldpet.domain.gold.entity.TransactionStatus
import com.goldpet.domain.gold.entity.TransactionType
import com.goldpet.domain.gold.repository.GoldTransactionRepository
import com.goldpet.domain.user.entity.User
import com.goldpet.domain.user.repository.UserRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import java.time.LocalDateTime
import java.util.*

class GoldServiceTest {

    @Mock
    private lateinit var transactionRepository: GoldTransactionRepository

    @Mock
    private lateinit var userRepository: UserRepository

    private lateinit var goldService: GoldService

    private lateinit var testUser: User

    @BeforeEach
    fun setUp() {
        MockitoAnnotations.openMocks(this)
        goldService = GoldService(transactionRepository, userRepository)

        testUser = createTestUser(1L, "testuser", "테스트유저")
        testUser.goldBalance = 1000
    }

    private fun createTestUser(id: Long, oauthId: String, nickname: String): User {
        return User(
            id = id,
            email = "$oauthId@example.com",
            oauthProvider = "LOCAL",
            oauthId = oauthId,
            username = oauthId,
            password = "password",
            nickname = nickname,
            name = nickname,
            birthDate = null,
            phoneNumber = null,
            gender = null,
            birthYear = null,
            mainLocationText = null,
            mainLocationGeom = null,
            profileImageUrl = null
        )
    }

    @Test
    fun `getBalance should return user gold balance with stats`() {
        // Given
        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(transactionRepository.sumAmountByUserAndTypeSince(any(), any(), any())).thenReturn(500)

        // When
        val result = goldService.getBalance(1L)

        // Then
        assertEquals(1000, result.balance)
    }

    @Test
    fun `getBalance should throw exception when user not found`() {
        // Given
        whenever(userRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        assertThrows<IllegalArgumentException> {
            goldService.getBalance(999L)
        }
    }

    @Test
    fun `getProducts should return hardcoded product list`() {
        // When
        val result = goldService.getProducts()

        // Then
        assertTrue(result.isNotEmpty())
        assertEquals("gold_10", result[0].id)
        assertEquals(10, result[0].goldAmount)
    }

    @Test
    fun `chargeGold should add gold to user balance`() {
        // Given
        val request = ChargeRequest(
            amount = 100,
            paymentMethod = "CARD",
            externalTransactionId = "ext_123"
        )

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(userRepository.save(any<User>())).thenReturn(testUser)
        whenever(transactionRepository.save(any<GoldTransaction>())).thenAnswer { invocation ->
            val transaction = invocation.getArgument<GoldTransaction>(0)
            GoldTransaction(
                id = 1L,
                user = transaction.user,
                type = transaction.type,
                amount = transaction.amount,
                balanceAfter = transaction.balanceAfter,
                description = transaction.description,
                paymentMethod = transaction.paymentMethod,
                externalTransactionId = transaction.externalTransactionId,
                status = TransactionStatus.COMPLETED
            ).apply {
                createdAt = LocalDateTime.now()
                updatedAt = LocalDateTime.now()
            }
        }

        // When
        val result = goldService.chargeGold(1L, request)

        // Then
        assertNotNull(result)
        assertEquals(100, result.amount)
        assertEquals(TransactionType.CHARGE, result.type)
        assertEquals(1100, testUser.goldBalance)  // 1000 + 100
    }

    @Test
    fun `chargeGold should throw exception when amount is not positive`() {
        // Given
        val request = ChargeRequest(amount = 0, paymentMethod = "CARD")
        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))

        // When & Then
        assertThrows<IllegalArgumentException> {
            goldService.chargeGold(1L, request)
        }
    }

    @Test
    fun `chargeGold should throw exception when user not found`() {
        // Given
        val request = ChargeRequest(amount = 100, paymentMethod = "CARD")
        whenever(userRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        assertThrows<IllegalArgumentException> {
            goldService.chargeGold(999L, request)
        }
    }

    @Test
    fun `spendGold should deduct gold from user balance`() {
        // Given
        val request = SpendRequest(
            amount = 500,
            description = "AI 프로필 생성"
        )

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(userRepository.save(any<User>())).thenReturn(testUser)
        whenever(transactionRepository.save(any<GoldTransaction>())).thenAnswer { invocation ->
            val transaction = invocation.getArgument<GoldTransaction>(0)
            GoldTransaction(
                id = 1L,
                user = transaction.user,
                type = transaction.type,
                amount = transaction.amount,
                balanceAfter = transaction.balanceAfter,
                description = transaction.description,
                status = TransactionStatus.COMPLETED
            ).apply {
                createdAt = LocalDateTime.now()
                updatedAt = LocalDateTime.now()
            }
        }

        // When
        val result = goldService.spendGold(1L, request)

        // Then
        assertNotNull(result)
        assertEquals(-500, result.amount)  // Spend amounts are negative
        assertEquals(TransactionType.SPEND, result.type)
        assertEquals(500, testUser.goldBalance)  // 1000 - 500
    }

    @Test
    fun `spendGold should throw exception when insufficient balance`() {
        // Given
        val request = SpendRequest(
            amount = 2000,  // More than balance
            description = "AI 프로필 생성"
        )
        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))

        // When & Then
        assertThrows<IllegalArgumentException> {
            goldService.spendGold(1L, request)
        }
    }

    @Test
    fun `spendGold should throw exception when amount is not positive`() {
        // Given
        val request = SpendRequest(amount = -100, description = "test")
        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))

        // When & Then
        assertThrows<IllegalArgumentException> {
            goldService.spendGold(1L, request)
        }
    }

    @Test
    fun `grantReward should add gold as reward`() {
        // Given
        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(userRepository.save(any<User>())).thenReturn(testUser)
        whenever(transactionRepository.save(any<GoldTransaction>())).thenAnswer { invocation ->
            val transaction = invocation.getArgument<GoldTransaction>(0)
            GoldTransaction(
                id = 1L,
                user = transaction.user,
                type = transaction.type,
                amount = transaction.amount,
                balanceAfter = transaction.balanceAfter,
                description = transaction.description,
                status = TransactionStatus.COMPLETED
            ).apply {
                createdAt = LocalDateTime.now()
                updatedAt = LocalDateTime.now()
            }
        }

        // When
        val result = goldService.grantReward(1L, 50, "일일 출석 보상")

        // Then
        assertNotNull(result)
        assertEquals(50, result.amount)
        assertEquals(TransactionType.REWARD, result.type)
        assertEquals(1050, testUser.goldBalance)  // 1000 + 50
    }

    @Test
    fun `grantReward should throw exception when user not found`() {
        // Given
        whenever(userRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        assertThrows<IllegalArgumentException> {
            goldService.grantReward(999L, 50, "보상")
        }
    }

    @Test
    fun `getTransactions should return paginated transaction history`() {
        // Given
        val pageable = PageRequest.of(0, 10)
        val transaction1 = GoldTransaction(
            id = 1L,
            user = testUser,
            type = TransactionType.CHARGE,
            amount = 100,
            balanceAfter = 1100,
            description = "골드 충전",
            status = TransactionStatus.COMPLETED
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }
        val transaction2 = GoldTransaction(
            id = 2L,
            user = testUser,
            type = TransactionType.SPEND,
            amount = -50,
            balanceAfter = 1050,
            description = "AI 프로필",
            status = TransactionStatus.COMPLETED
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }
        val transactions = listOf(transaction1, transaction2)
        val page = PageImpl(transactions, pageable, 2)

        whenever(transactionRepository.findAllByUserIdOrderByCreatedAtDesc(1L, pageable)).thenReturn(page)

        // When
        val result = goldService.getTransactions(1L, pageable)

        // Then
        assertEquals(2, result.content.size)
        assertEquals(100, result.content[0].amount)
        assertEquals(-50, result.content[1].amount)
    }
}
