package com.goldpet.domain.auth.service

import com.goldpet.config.jwt.JwtTokenProvider
import com.goldpet.domain.auth.dto.LoginRequest
import com.goldpet.domain.auth.dto.SignupRequest
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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import java.util.*

class AuthServiceTest {

    @Mock
    private lateinit var userRepository: UserRepository

    @Mock
    private lateinit var jwtTokenProvider: JwtTokenProvider

    private lateinit var passwordEncoder: PasswordEncoder
    private lateinit var authService: AuthService

    @BeforeEach
    fun setUp() {
        MockitoAnnotations.openMocks(this)
        passwordEncoder = BCryptPasswordEncoder()
        authService = AuthService(userRepository, passwordEncoder, jwtTokenProvider)
    }

    private fun createTestUser(id: Long, oauthId: String, nickname: String): User {
        return User(
            id = id,
            email = "$oauthId@example.com",
            oauthProvider = "LOCAL",
            oauthId = oauthId,
            username = oauthId,
            password = passwordEncoder.encode("password123"),
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
    fun `signup should create user and return auth response`() {
        // Given
        val request = SignupRequest(
            username = "testuser",
            password = "password123",
            nickname = "테스트유저",
            name = "홍길동",
            birthDate = "1990-01-01",
            phoneNumber = "01012345678",
            email = "test@example.com",
            gender = "M",
            birthYear = 1990,
            mainLocationText = "서울시 강남구"
        )

        whenever(userRepository.findByUsername("testuser")).thenReturn(Optional.empty())
        whenever(userRepository.save(any<User>())).thenAnswer { invocation ->
            val user = invocation.getArgument<User>(0)
            User(
                id = 1L,
                email = user.email,
                oauthProvider = user.oauthProvider,
                oauthId = user.oauthId,
                username = user.username,
                password = user.password,
                nickname = user.nickname,
                name = user.name,
                birthDate = user.birthDate,
                phoneNumber = user.phoneNumber,
                gender = user.gender,
                birthYear = user.birthYear,
                mainLocationText = user.mainLocationText,
                mainLocationGeom = user.mainLocationGeom,
                profileImageUrl = user.profileImageUrl
            )
        }
        whenever(jwtTokenProvider.generateToken(any())).thenReturn("test-access-token")
        whenever(jwtTokenProvider.generateRefreshToken(any())).thenReturn("test-refresh-token")

        // When
        val response = authService.signup(request)

        // Then
        assertNotNull(response)
        assertEquals("test-access-token", response.accessToken)
        assertNotNull(response.user)
        assertEquals("testuser", response.user.username)
        assertEquals("테스트유저", response.user.nickname)
    }

    @Test
    fun `signup should fail when username already exists`() {
        // Given
        val request = SignupRequest(
            username = "existinguser",
            password = "password123",
            nickname = "테스트유저",
            name = "홍길동",
            birthDate = "1990-01-01",
            phoneNumber = "01012345678",
            email = null,
            gender = null,
            birthYear = null,
            mainLocationText = null
        )

        val existingUser = createTestUser(1L, "existinguser", "기존유저")
        whenever(userRepository.findByUsername("existinguser")).thenReturn(Optional.of(existingUser))

        // When & Then
        assertThrows<IllegalArgumentException> {
            authService.signup(request)
        }
    }

    @Test
    fun `login should succeed with valid credentials`() {
        // Given
        val encodedPassword = passwordEncoder.encode("password123")
        val user = User(
            id = 1L,
            email = "testuser@example.com",
            oauthProvider = "LOCAL",
            oauthId = "LOCAL_testuser",
            username = "testuser",
            password = encodedPassword,
            nickname = "테스트유저",
            name = "테스트유저",
            birthDate = null,
            phoneNumber = null,
            gender = null,
            birthYear = null,
            mainLocationText = null,
            mainLocationGeom = null,
            profileImageUrl = null
        )

        val request = LoginRequest(username = "testuser", password = "password123")

        whenever(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user))
        whenever(jwtTokenProvider.generateToken(any())).thenReturn("test-access-token")
        whenever(jwtTokenProvider.generateRefreshToken(any())).thenReturn("test-refresh-token")

        // When
        val response = authService.login(request)

        // Then
        assertNotNull(response)
        assertEquals("test-access-token", response.accessToken)
        assertEquals("testuser", response.user.username)
    }

    @Test
    fun `login should fail with invalid username`() {
        // Given
        val request = LoginRequest(username = "nonexistent", password = "password123")
        whenever(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty())

        // When & Then
        assertThrows<IllegalArgumentException> {
            authService.login(request)
        }
    }

    @Test
    fun `login should fail with invalid password`() {
        // Given
        val encodedPassword = passwordEncoder.encode("correctpassword")
        val user = User(
            id = 1L,
            email = "testuser@example.com",
            oauthProvider = "LOCAL",
            oauthId = "LOCAL_testuser",
            username = "testuser",
            password = encodedPassword,
            nickname = "테스트유저",
            name = "테스트유저",
            birthDate = null,
            phoneNumber = null,
            gender = null,
            birthYear = null,
            mainLocationText = null,
            mainLocationGeom = null,
            profileImageUrl = null
        )

        val request = LoginRequest(username = "testuser", password = "wrongpassword")
        whenever(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user))

        // When & Then
        assertThrows<IllegalArgumentException> {
            authService.login(request)
        }
    }

    @Test
    fun `login should fail when user has no password set`() {
        // Given (OAuth user with no password)
        val user = User(
            id = 1L,
            email = "kakao123@kakao.com",
            oauthProvider = "KAKAO",
            oauthId = "kakao123",
            username = null,
            password = null,
            nickname = "카카오유저",
            name = "카카오유저",
            birthDate = null,
            phoneNumber = null,
            gender = null,
            birthYear = null,
            mainLocationText = null,
            mainLocationGeom = null,
            profileImageUrl = null
        )

        val request = LoginRequest(username = "kakaouser", password = "password123")
        whenever(userRepository.findByUsername("kakaouser")).thenReturn(Optional.of(user))

        // When & Then
        assertThrows<IllegalArgumentException> {
            authService.login(request)
        }
    }

    @Test
    fun `devLogin should return auth response`() {
        // Given
        val user = createTestUser(1L, "devuser", "개발유저")

        whenever(jwtTokenProvider.generateToken(any())).thenReturn("test-access-token")
        whenever(jwtTokenProvider.generateRefreshToken(any())).thenReturn("test-refresh-token")

        // When
        val response = authService.devLogin(user)

        // Then
        assertNotNull(response)
        assertEquals("test-access-token", response.accessToken)
        assertEquals("devuser", response.user.username)
    }
}
