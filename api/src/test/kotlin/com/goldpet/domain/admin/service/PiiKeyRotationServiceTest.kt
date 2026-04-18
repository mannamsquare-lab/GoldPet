package com.goldpet.domain.admin.service

import com.goldpet.config.crypto.EncryptionConfig
import com.goldpet.config.crypto.EncryptionConverter
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentMatchers.anyString
import org.mockito.ArgumentMatchers.nullable
import org.mockito.Mock
import org.mockito.Mockito
import org.mockito.Mockito.doAnswer
import org.mockito.Mockito.doReturn
import org.mockito.Mockito.never
import org.mockito.Mockito.times
import org.mockito.Mockito.verify
import org.mockito.invocation.InvocationOnMock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.junit.jupiter.MockitoSettings
import org.mockito.quality.Strictness
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.transaction.PlatformTransactionManager
import org.springframework.transaction.TransactionDefinition
import org.springframework.transaction.TransactionStatus

@ExtendWith(MockitoExtension::class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PiiKeyRotationServiceTest {

    @Mock private lateinit var jdbcTemplate: JdbcTemplate
    @Mock private lateinit var transactionManager: PlatformTransactionManager
    @Mock private lateinit var txStatus: TransactionStatus
    @Mock private lateinit var auditService: AdminAuditService

    private lateinit var service: PiiKeyRotationService

    companion object {
        private const val PRIMARY_KEY = "primary-key-for-unit-test-only!"
        private const val SECONDARY_KEY = "secondary-key-for-unit-tests!!!!"
    }

    @BeforeEach
    fun setUp() {
        EncryptionConfig(PRIMARY_KEY, SECONDARY_KEY).validate()
        service = PiiKeyRotationService(jdbcTemplate, transactionManager, auditService)

        // Allow TransactionTemplate.execute() to run lambdas without a real DataSource
        doReturn(txStatus).`when`(transactionManager).getTransaction(
            Mockito.any(TransactionDefinition::class.java)
        )

        // Default: advisory lock acquired (pg_try_advisory_lock → true, pg_advisory_unlock → true)
        doAnswer { invoc: InvocationOnMock ->
            val sql = invoc.getArgument<String>(0)
            "pg_try_advisory_lock" in sql || "pg_advisory_unlock" in sql
        }.`when`(jdbcTemplate).queryForObject(
            anyString(),
            Mockito.any(Class::class.java),
            Mockito.any(Any::class.java)
        )

        // Default: FOR UPDATE row-lock query (vararg version); result is not used by service
        doReturn(listOf<Map<String, Any>>()).`when`(jdbcTemplate).queryForList(
            anyString(),
            Mockito.any(Any::class.java)
        )
    }

    /**
     * Encrypt plaintext with the given key, then restore config to primary+secondary.
     */
    private fun encryptWith(plaintext: String, key: String): String {
        EncryptionConfig(key, "").validate()
        val ciphertext = EncryptionConverter().convertToDatabaseColumn(plaintext)!!
        EncryptionConfig(PRIMARY_KEY, SECONDARY_KEY).validate()
        return ciphertext
    }

    /**
     * Stub the no-arg queryForList overload used for the main user SELECT and verification SELECT.
     * Differentiates by SQL content: "phone_number" → mainRows, "email_hash" → verificationRows.
     */
    private fun stubUserRows(mainRows: List<Map<String, Any?>>, verificationRows: List<Map<String, Any?>>) {
        doAnswer { invoc: InvocationOnMock ->
            val sql = invoc.getArgument<String>(0)
            when {
                "phone_number" in sql -> mainRows
                "email_hash" in sql -> verificationRows
                else -> emptyList<Map<String, Any?>>()
            }
        }.`when`(jdbcTemplate).queryForList(anyString())
    }

    @Test
    fun `throws ConcurrentRotationException when advisory lock is contended`() {
        doReturn(false).`when`(jdbcTemplate).queryForObject(
            anyString(),
            Mockito.any(Class::class.java),
            Mockito.any(Any::class.java)
        )

        assertThrows<PiiKeyRotationService.ConcurrentRotationException> {
            service.rotate(dryRun = false, principalId = 1L)
        }
    }

    @Test
    fun `row encrypted with primary key is counted as skippedAlreadyNew`() {
        val emailCipher = encryptWith("user@example.com", PRIMARY_KEY)
        val userId = 42L
        val mainRow = mapOf<String, Any?>(
            "id" to userId, "email" to emailCipher,
            "name" to null, "phone_number" to null, "birth_date" to null
        )
        stubUserRows(listOf(mainRow), emptyList())

        val result = service.rotate(dryRun = false, principalId = 1L)

        assertEquals(0, result.rotated)
        assertEquals(1, result.skippedAlreadyNew)
        assertEquals(0, result.failed)
        assertFalse(result.dryRun)
        verify(jdbcTemplate, never()).update(
            anyString(),
            nullable(Any::class.java), nullable(Any::class.java), nullable(Any::class.java),
            nullable(Any::class.java), nullable(Any::class.java), nullable(Any::class.java)
        )
    }

    @Test
    fun `row encrypted with secondary key is rotated and UPDATE is issued`() {
        val emailCipher = encryptWith("user@example.com", SECONDARY_KEY)
        val userId = 42L
        val mainRow = mapOf<String, Any?>(
            "id" to userId, "email" to emailCipher,
            "name" to null, "phone_number" to null, "birth_date" to null
        )
        stubUserRows(listOf(mainRow), emptyList())
        // name/phone_number/birth_date are null → use nullable() matchers, not any()
        doReturn(1).`when`(jdbcTemplate).update(
            anyString(),
            nullable(Any::class.java), nullable(Any::class.java), nullable(Any::class.java),
            nullable(Any::class.java), nullable(Any::class.java), nullable(Any::class.java)
        )

        val result = service.rotate(dryRun = false, principalId = 1L)

        assertEquals(1, result.rotated)
        assertEquals(0, result.skippedAlreadyNew)
        assertEquals(0, result.failed)
        assertFalse(result.dryRun)
        verify(jdbcTemplate, times(1)).update(
            anyString(),
            nullable(Any::class.java), nullable(Any::class.java), nullable(Any::class.java),
            nullable(Any::class.java), nullable(Any::class.java), nullable(Any::class.java)
        )
    }

    @Test
    fun `dry run does not issue UPDATE even for a secondary-encrypted row`() {
        val emailCipher = encryptWith("user@example.com", SECONDARY_KEY)
        val userId = 42L
        val mainRow = mapOf<String, Any?>(
            "id" to userId, "email" to emailCipher,
            "name" to null, "phone_number" to null, "birth_date" to null
        )
        stubUserRows(listOf(mainRow), emptyList())

        val result = service.rotate(dryRun = true, principalId = 1L)

        assertEquals(1, result.rotated, "dry-run still counts the row as needing rotation")
        assertTrue(result.dryRun)
        verify(jdbcTemplate, never()).update(
            anyString(),
            nullable(Any::class.java), nullable(Any::class.java), nullable(Any::class.java),
            nullable(Any::class.java), nullable(Any::class.java), nullable(Any::class.java)
        )
    }

    @Test
    fun `row with all null PII columns is counted as skippedAlreadyNew with no UPDATE`() {
        val userId = 99L
        val mainRow = mapOf<String, Any?>(
            "id" to userId, "email" to null,
            "name" to null, "phone_number" to null, "birth_date" to null
        )
        stubUserRows(listOf(mainRow), emptyList())

        val result = service.rotate(dryRun = false, principalId = 1L)

        assertEquals(0, result.rotated)
        assertEquals(1, result.skippedAlreadyNew)
        assertEquals(0, result.failed)
        verify(jdbcTemplate, never()).update(
            anyString(),
            nullable(Any::class.java), nullable(Any::class.java), nullable(Any::class.java),
            nullable(Any::class.java), nullable(Any::class.java), nullable(Any::class.java)
        )
    }
}
