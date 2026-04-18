package com.goldpet.domain.admin.service

import com.goldpet.config.crypto.EncryptionConfig
import com.goldpet.config.jwt.JwtTokenProvider
import com.goldpet.domain.admin.entity.AdminUser
import com.goldpet.domain.admin.entity.AdminUserRole
import com.goldpet.domain.admin.repository.AdminUserRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.MockitoAnnotations
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.LocalDateTime
import java.util.*

class AdminAuthServiceTest {

    @Mock
    private lateinit var adminUserRepository: AdminUserRepository

    @Mock
    private lateinit var jwtTokenProvider: JwtTokenProvider

    @Mock
    private lateinit var adminTotpService: AdminTotpService

    private lateinit var passwordEncoder: PasswordEncoder
    private lateinit var adminAuthService: AdminAuthService
    private lateinit var testAdminUser: AdminUser

    @BeforeEach
    fun setUp() {
        MockitoAnnotations.openMocks(this)
        passwordEncoder = BCryptPasswordEncoder()
        // AdminAuthService가 BlindIndexUtil.hash를 호출하므로 EncryptionConfig.instance 필요
        EncryptionConfig("admin-auth-test-key-32-chars!!!!", "").validate()

        adminAuthService = AdminAuthService(
            adminUserRepository,
            passwordEncoder,
            jwtTokenProvider,
            adminTotpService
        )

        testAdminUser = AdminUser(
            id = 1L,
            email = "admin@goldpet.com",
            passwordHash = passwordEncoder.encode("admin123"),
            name = "테스트관리자",
            role = AdminUserRole.SUPER_ADMIN,
            otpSecret = null,
            isActive = true
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }
    }

    @Test
    fun `login should succeed with valid credentials`() {
        // Given
        whenever(adminUserRepository.findByEmailHash(any()))
            .thenReturn(Optional.of(testAdminUser))
        whenever(jwtTokenProvider.generateToken(any()))
            .thenReturn("test-jwt-token")

        // When
        val (token, adminUser) = adminAuthService.login("admin@goldpet.com", "admin123")

        // Then
        assertNotNull(token)
        assertEquals("test-jwt-token", token)
        assertEquals("admin@goldpet.com", adminUser.email)
        assertEquals("테스트관리자", adminUser.name)
        assertEquals(AdminUserRole.SUPER_ADMIN, adminUser.role)
    }

    @Test
    fun `login should fail with invalid email`() {
        // Given
        whenever(adminUserRepository.findByEmailHash(any()))
            .thenReturn(Optional.empty())

        // When & Then
        val exception = assertThrows<BadCredentialsException> {
            adminAuthService.login("invalid@goldpet.com", "admin123")
        }
        assertEquals("Invalid Email or Password", exception.message)
    }

    @Test
    fun `login should fail with invalid password`() {
        // Given
        whenever(adminUserRepository.findByEmailHash(any()))
            .thenReturn(Optional.of(testAdminUser))

        // When & Then
        val exception = assertThrows<BadCredentialsException> {
            adminAuthService.login("admin@goldpet.com", "wrongpassword")
        }
        assertEquals("Invalid Email or Password", exception.message)
    }

    @Test
    fun `login should fail when account is disabled`() {
        // Given
        val disabledUser = AdminUser(
            id = 1L,
            email = "admin@goldpet.com",
            passwordHash = passwordEncoder.encode("admin123"),
            name = "테스트관리자",
            role = AdminUserRole.SUPER_ADMIN,
            otpSecret = null,
            isActive = false
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }
        whenever(adminUserRepository.findByEmailHash(any()))
            .thenReturn(Optional.of(disabledUser))

        // When & Then
        val exception = assertThrows<BadCredentialsException> {
            adminAuthService.login("admin@goldpet.com", "admin123")
        }
        assertEquals("Account is disabled", exception.message)
    }

    @Test
    fun `login should return null token when 2FA is enabled`() {
        // Given
        val userWith2FA = AdminUser(
            id = 1L,
            email = "admin@goldpet.com",
            passwordHash = passwordEncoder.encode("admin123"),
            name = "테스트관리자",
            role = AdminUserRole.SUPER_ADMIN,
            otpSecret = "JBSWY3DPEHPK3PXP",
            isActive = true
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }
        whenever(adminUserRepository.findByEmailHash(any()))
            .thenReturn(Optional.of(userWith2FA))

        // When
        val (token, adminUser) = adminAuthService.login("admin@goldpet.com", "admin123")

        // Then
        assertNull(token)
        assertEquals("admin@goldpet.com", adminUser.email)
        assertNotNull(adminUser.otpSecret)
    }

    @Test
    fun `verify2fa should succeed with valid code`() {
        // Given
        val userWith2FA = AdminUser(
            id = 1L,
            email = "admin@goldpet.com",
            passwordHash = passwordEncoder.encode("admin123"),
            name = "테스트관리자",
            role = AdminUserRole.SUPER_ADMIN,
            otpSecret = "JBSWY3DPEHPK3PXP",
            isActive = true
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }
        whenever(adminUserRepository.findById(1L))
            .thenReturn(Optional.of(userWith2FA))
        whenever(adminTotpService.validateCode("JBSWY3DPEHPK3PXP", 123456))
            .thenReturn(true)
        whenever(jwtTokenProvider.generateToken(any()))
            .thenReturn("test-jwt-token")

        // When
        val (token, adminUser) = adminAuthService.verify2fa(1L, 123456)

        // Then
        assertNotNull(token)
        assertEquals("test-jwt-token", token)
        assertEquals("admin@goldpet.com", adminUser.email)
    }

    @Test
    fun `verify2fa should fail with invalid code`() {
        // Given
        val userWith2FA = AdminUser(
            id = 1L,
            email = "admin@goldpet.com",
            passwordHash = passwordEncoder.encode("admin123"),
            name = "테스트관리자",
            role = AdminUserRole.SUPER_ADMIN,
            otpSecret = "JBSWY3DPEHPK3PXP",
            isActive = true
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }
        whenever(adminUserRepository.findById(1L))
            .thenReturn(Optional.of(userWith2FA))
        whenever(adminTotpService.validateCode("JBSWY3DPEHPK3PXP", 0))
            .thenReturn(false)

        // When & Then
        val exception = assertThrows<BadCredentialsException> {
            adminAuthService.verify2fa(1L, 0)
        }
        assertEquals("Invalid 2FA Code", exception.message)
    }

    @Test
    fun `setup2fa should return secret and QR URL`() {
        // Given
        whenever(adminUserRepository.findById(1L))
            .thenReturn(Optional.of(testAdminUser))
        whenever(adminTotpService.generateSecret())
            .thenReturn("NEWTOTP123456")
        whenever(adminTotpService.getQrCodeUrl("NEWTOTP123456", "admin@goldpet.com"))
            .thenReturn("otpauth://totp/GoldPet:admin@goldpet.com?secret=NEWTOTP123456")

        // When
        val (secret, qrUrl) = adminAuthService.setup2fa(1L)

        // Then
        assertEquals("NEWTOTP123456", secret)
        assertTrue(qrUrl.contains("otpauth://totp"))
        assertTrue(qrUrl.contains("admin@goldpet.com"))
    }
}
