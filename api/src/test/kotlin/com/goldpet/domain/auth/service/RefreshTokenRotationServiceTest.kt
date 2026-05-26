package com.goldpet.domain.auth.service

import com.goldpet.config.jwt.JwtTokenProvider
import com.goldpet.domain.auth.entity.RefreshTokenRevokeReason
import com.goldpet.domain.auth.entity.UserRefreshToken
import com.goldpet.domain.auth.repository.UserRefreshTokenRepository
import com.goldpet.domain.common.exception.UnauthorizedException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.ArgumentCaptor
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.LocalDateTime
import java.util.Optional

class RefreshTokenRotationServiceTest {

    @Mock private lateinit var repo: UserRefreshTokenRepository
    @Mock private lateinit var jwt: JwtTokenProvider

    private lateinit var service: RefreshTokenRotationService

    @BeforeEach
    fun setUp() {
        MockitoAnnotations.openMocks(this)
        service = RefreshTokenRotationService(repo, jwt)
        // default: 토큰 검증/파싱 stub
        whenever(jwt.validateRefreshToken(any())).thenReturn(true)
        whenever(jwt.getUserIdFromRefreshToken(any())).thenReturn(100L)
        whenever(jwt.generateRefreshToken(any())).thenReturn("new-jwt-token")
        whenever(jwt.getRefreshExpiry(any())).thenReturn(LocalDateTime.now().plusDays(30))
    }

    private fun row(
        userId: Long = 100L,
        deviceId: String = "device-A",
        tokenHash: String = "OLD_HASH",
        parentHash: String? = null,
        revokedAt: LocalDateTime? = null,
        issuedAt: LocalDateTime = LocalDateTime.now().minusMinutes(1),
    ) = UserRefreshToken(
        userId = userId,
        deviceId = deviceId,
        tokenHash = tokenHash,
        parentTokenHash = parentHash,
        issuedAt = issuedAt,
        expiresAt = LocalDateTime.now().plusDays(30),
        revokedAt = revokedAt,
    )

    @Test
    fun `legacy compat — no DB row creates new chain (parent=NULL)`() {
        whenever(repo.findByTokenHash(any())).thenReturn(Optional.empty())

        val result = service.rotate(oldToken = "any.jwt.token", deviceId = "device-A")

        assertEquals("new-jwt-token", result.newRefreshToken)
        assertEquals(100L, result.userId)

        val saved = ArgumentCaptor.forClass(UserRefreshToken::class.java)
        verify(repo).save(saved.capture())
        assertEquals("device-A", saved.value.deviceId)
        assertEquals(null, saved.value.parentTokenHash, "Legacy compat must persist parent=NULL")
        verify(repo, never()).revokeByTokenHash(any(), any(), any())
        verify(repo, never()).revokeAllForDevice(any(), any(), any(), any())
    }

    @Test
    fun `normal rotation — revoked=false revokes parent and inserts new chain link`() {
        val existing = row(revokedAt = null)
        whenever(repo.findByTokenHash(any())).thenReturn(Optional.of(existing))

        val result = service.rotate(oldToken = "valid.jwt", deviceId = "device-A")

        assertEquals("new-jwt-token", result.newRefreshToken)
        verify(repo).revokeByTokenHash(any(), any(), eq(RefreshTokenRevokeReason.ROTATED))

        val saved = ArgumentCaptor.forClass(UserRefreshToken::class.java)
        verify(repo).save(saved.capture())
        assertNotNull(saved.value.parentTokenHash, "New row must carry parent_token_hash for chain tracking")
        assertEquals("device-A", saved.value.deviceId)
        verify(repo, never()).revokeAllForDevice(any(), any(), any(), any())
    }

    @Test
    fun `grace window — same device child within 5s waives REUSE and issues new token`() {
        val now = LocalDateTime.now()
        val revoked = row(revokedAt = now.minusSeconds(2))
        val child = row(
            tokenHash = "CHILD_HASH",
            parentHash = "OLD_HASH",
            deviceId = "device-A",
            revokedAt = null,
            issuedAt = now.minusSeconds(2),
        )
        whenever(repo.findByTokenHash(any())).thenReturn(Optional.of(revoked))
        whenever(repo.findByParentTokenHash(any())).thenReturn(Optional.of(child))

        val result = service.rotate(oldToken = "valid.jwt", deviceId = "device-A")

        assertEquals("new-jwt-token", result.newRefreshToken)
        verify(repo).save(any())  // new chain branch
        // REUSE never triggered
        verify(repo, never()).revokeAllForDevice(any(), any(), any(), eq(RefreshTokenRevokeReason.REUSE_DETECTED))
    }

    @Test
    fun `reuse detected — revoked token replayed after grace window revokes whole device chain`() {
        val now = LocalDateTime.now()
        val revoked = row(revokedAt = now.minusMinutes(2))  // way beyond 5s
        val child = row(
            tokenHash = "CHILD_HASH",
            parentHash = "OLD_HASH",
            issuedAt = now.minusMinutes(2),
        )
        whenever(repo.findByTokenHash(any())).thenReturn(Optional.of(revoked))
        whenever(repo.findByParentTokenHash(any())).thenReturn(Optional.of(child))

        val ex = assertThrows<UnauthorizedException> {
            service.rotate(oldToken = "stolen.jwt", deviceId = "device-A")
        }
        assert(ex.message!!.contains("reuse"))

        verify(repo).revokeAllForDevice(
            eq(100L), eq("device-A"), any(),
            eq(RefreshTokenRevokeReason.REUSE_DETECTED),
        )
        verify(repo, never()).save(any())
    }

    @Test
    fun `invalid signature throws Unauthorized without DB access`() {
        whenever(jwt.validateRefreshToken(any())).thenReturn(false)

        assertThrows<UnauthorizedException> {
            service.rotate(oldToken = "tampered.jwt", deviceId = "device-A")
        }
        verify(repo, never()).findByTokenHash(any())
    }

    @Test
    fun `issueInitial persists new row with parent=NULL`() {
        val token = service.issueInitial(userId = 200L, deviceId = "device-B")
        assertEquals("new-jwt-token", token)

        val saved = ArgumentCaptor.forClass(UserRefreshToken::class.java)
        verify(repo).save(saved.capture())
        assertEquals(200L, saved.value.userId)
        assertEquals("device-B", saved.value.deviceId)
        assertEquals(null, saved.value.parentTokenHash)
    }

    @Test
    fun `null deviceId falls back to legacy-userId pattern`() {
        whenever(repo.findByTokenHash(any())).thenReturn(Optional.empty())

        service.rotate(oldToken = "valid.jwt", deviceId = null)

        val saved = ArgumentCaptor.forClass(UserRefreshToken::class.java)
        verify(repo).save(saved.capture())
        assertEquals("legacy-100", saved.value.deviceId)
    }
}
