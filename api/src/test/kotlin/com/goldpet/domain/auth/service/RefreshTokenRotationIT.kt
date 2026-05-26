package com.goldpet.domain.auth.service

import com.goldpet.IntegrationTestBase
import com.goldpet.config.jwt.JwtTokenProvider
import com.goldpet.domain.auth.entity.RefreshTokenRevokeReason
import com.goldpet.domain.auth.repository.UserRefreshTokenRepository
import com.goldpet.domain.common.exception.UnauthorizedException
import com.goldpet.domain.user.entity.User
import com.goldpet.domain.user.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import java.time.LocalDateTime

/**
 * V66 통합 테스트 — 실 토큰 발급 → rotate → reuse 흐름.
 *
 * 실행 전: `./deploy-local/scripts/start.sh` 로 local PostGIS(5433) 기동.
 * 5 시나리오:
 *  1. issueInitial — DB row 생성 (parent=NULL)
 *  2. 정상 회전 — old ROTATED revoke + new chain link 생성 (parentHash 설정)
 *  3. legacy compat — DB row 없는 token 회전 시 새 chain 시작
 *  4. grace window — revoke 직후 5초 내 동일 device 재호출 → REUSE 면제 + 새 token 발급
 *  5. reuse detected — revoked token 을 grace window 밖에서 재사용 → device chain 전체 REUSE_DETECTED
 */
class RefreshTokenRotationIT : IntegrationTestBase() {

    @Autowired private lateinit var rotationService: RefreshTokenRotationService
    @Autowired private lateinit var tokenRepo: UserRefreshTokenRepository
    @Autowired private lateinit var jwt: JwtTokenProvider
    @Autowired private lateinit var userRepository: UserRepository

    private lateinit var testUser: User
    private val deviceA = "v66-it-device-A"
    private val deviceB = "v66-it-device-B"

    @BeforeEach
    fun seedTokens() {
        // 이전 IT 잔존 row 제거 (deviceA/deviceB 한정)
        tokenRepo.findAll()
            .filter { it.deviceId == deviceA || it.deviceId == deviceB }
            .forEach { tokenRepo.deleteById(it.id) }
        testUser = userRepository.findAll().firstOrNull()
            ?: error("Test DB must seed at least one user")
    }

    @Test
    fun `issueInitial persists row with parent=NULL`() {
        val token = rotationService.issueInitial(testUser.id, deviceA)
        assertNotNull(token)

        val active = tokenRepo.findActiveByUserAndDevice(testUser.id, deviceA, LocalDateTime.now())
        assertEquals(1, active.size, "issueInitial must create exactly 1 active row")
        assertNull(active[0].parentTokenHash, "Initial row must have parent=NULL")
        assertNull(active[0].revokedAt)
    }

    @Test
    fun `normal rotation revokes parent and links new row via parent_token_hash`() {
        val initial = rotationService.issueInitial(testUser.id, deviceA)
        val rotated = rotationService.rotate(initial, deviceA)
        assertNotEquals(initial, rotated.newRefreshToken, "Rotation must yield a different token")

        val rows = tokenRepo.findAll().filter { it.userId == testUser.id && it.deviceId == deviceA }
        assertEquals(2, rows.size, "After rotation: 1 revoked + 1 active = 2 rows for device")

        val revoked = rows.find { it.revokedAt != null }
        val active = rows.find { it.revokedAt == null }
        assertNotNull(revoked, "Parent must be revoked")
        assertNotNull(active, "New token row must exist active")
        assertEquals(RefreshTokenRevokeReason.ROTATED, revoked!!.revokeReason)
        assertNotNull(active!!.parentTokenHash, "New row must carry parent_token_hash for chain")
        assertEquals(revoked.tokenHash, active.parentTokenHash, "parent_token_hash must match revoked token's hash")
    }

    @Test
    fun `legacy compat — rotating a token with no DB row creates a fresh chain`() {
        // pre-V66 token 시뮬레이션 — issueInitial 호출 없이 직접 JWT 발급
        val legacyToken = jwt.generateRefreshToken(testUser.id)
        val result = rotationService.rotate(legacyToken, deviceA)
        assertNotNull(result.newRefreshToken)

        val rows = tokenRepo.findAll().filter { it.userId == testUser.id && it.deviceId == deviceA }
        assertEquals(1, rows.size, "Legacy compat must create exactly 1 new chain row")
        assertNull(rows[0].parentTokenHash, "Legacy compat chain starts with parent=NULL")
    }

    @Test
    fun `grace window — same-device rotation within 5s of revocation does NOT trigger REUSE`() {
        val initial = rotationService.issueInitial(testUser.id, deviceA)
        val firstRotation = rotationService.rotate(initial, deviceA)

        // 즉시 동일 parent 로 두 번째 rotate — race 시나리오 (앱 백그라운드 복귀 직후 동시 호출)
        val secondRotation = rotationService.rotate(initial, deviceA)
        assertNotNull(secondRotation.newRefreshToken)
        assertNotEquals(firstRotation.newRefreshToken, secondRotation.newRefreshToken)

        // REUSE_DETECTED 미발동 검증 — device A 의 chain 이 살아있어야 함
        val activeRows = tokenRepo.findActiveByUserAndDevice(testUser.id, deviceA, LocalDateTime.now())
        assertTrue(activeRows.isNotEmpty(), "Device chain must remain after grace-window race")
        val anyReuse = tokenRepo.findAll().any { it.deviceId == deviceA && it.revokeReason == RefreshTokenRevokeReason.REUSE_DETECTED }
        assertEquals(false, anyReuse, "REUSE_DETECTED must NOT fire within grace window")
    }

    @Test
    fun `reuse detection — replaying revoked token outside grace window revokes whole device chain (deviceA only)`() {
        val tokenA = rotationService.issueInitial(testUser.id, deviceA)
        val tokenB = rotationService.issueInitial(testUser.id, deviceB)
        val rotatedA = rotationService.rotate(tokenA, deviceA)
        assertNotNull(rotatedA.newRefreshToken)

        // grace window 초과 시뮬레이션 — revoked_at 을 강제로 10초 과거로 backdate
        val revokedRow = tokenRepo.findAll().first { it.deviceId == deviceA && it.revokedAt != null }
        revokedRow.revokedAt = LocalDateTime.now().minusSeconds(10)
        tokenRepo.save(revokedRow)

        // 이미 revoked 된 tokenA 를 재사용 시도 → REUSE_DETECTED
        assertThrows<UnauthorizedException> {
            rotationService.rotate(tokenA, deviceA)
        }

        // deviceA chain 전체 revoke 검증
        val activeA = tokenRepo.findActiveByUserAndDevice(testUser.id, deviceA, LocalDateTime.now())
        assertEquals(0, activeA.size, "deviceA chain must be fully revoked")
        val reuseRow = tokenRepo.findAll().any { it.deviceId == deviceA && it.revokeReason == RefreshTokenRevokeReason.REUSE_DETECTED }
        assertTrue(reuseRow, "REUSE_DETECTED must be recorded for deviceA")

        // deviceB 영향 없음 검증
        val activeB = tokenRepo.findActiveByUserAndDevice(testUser.id, deviceB, LocalDateTime.now())
        assertEquals(1, activeB.size, "deviceB chain must remain active (other device unaffected)")
    }
}
