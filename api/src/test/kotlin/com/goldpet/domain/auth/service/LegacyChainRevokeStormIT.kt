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
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import java.time.LocalDateTime

/**
 * BLOCKER #2 (BE) — `legacy-{userId}` cross-device revoke **storm** 결정적 재현 IT.
 *
 * 배경:
 *   클라이언트가 `X-Device-Id` 헤더를 보내지 않으면 [RefreshTokenRotationService.rotate] 의
 *   `resolvedDeviceId = deviceId?.takeIf { it.isNotBlank() } ?: "legacy-$userId"` 분기에 의해
 *   **한 유저의 모든 기기 토큰이 단일 `legacy-{userId}` chain 으로 붕괴**한다.
 *   이 상태에서 한 기기가 만료(revoked)된 토큰을 grace window 밖에서 재사용하면
 *   reuse-detection 이 `revokeAllForDevice(legacy-{userId})` 로 **해당 유저의 모든 기기 토큰을 한꺼번에 revoke** —
 *   즉, 무고한 다른 기기까지 강제 로그아웃되는 "storm" 이 발생한다.
 *
 * 본 IT 는 두 가지를 결정적으로 단언한다.
 *   1. STORM (deviceId 미전송): legacy bucket 붕괴 → 한 토큰 reuse 가 다른 기기 토큰까지 전멸 (EXPECTED 회귀 가드).
 *   2. ISOLATION (deviceId 분리 전송): 기기별 독립 chain → 한 기기 revoke 가 다른 기기에 무영향 (수정안 PASS 조건).
 *
 * 패턴: [RefreshTokenRotationIT] 의 `revokedAt` backdate 기법 재사용(별도 Clock 추상화 불필요).
 * GRACE_WINDOW_SECONDS = 5 → revokedAt 을 10초 과거로 backdate 해 grace window 를 강제 경과시킨다.
 *
 * 실행 전: `./deploy-local/scripts/start.sh` 로 local PostGIS(5433) 기동.
 */
@Tag("integration")
class LegacyChainRevokeStormIT : IntegrationTestBase() {

    @Autowired private lateinit var rotationService: RefreshTokenRotationService
    @Autowired private lateinit var tokenRepo: UserRefreshTokenRepository
    @Autowired private lateinit var jwt: JwtTokenProvider
    @Autowired private lateinit var userRepository: UserRepository

    private lateinit var testUser: User
    private lateinit var legacyDeviceId: String
    private val deviceA = "storm-it-device-A"
    private val deviceB = "storm-it-device-B"

    @BeforeEach
    fun seed() {
        testUser = userRepository.findAll().firstOrNull()
            ?: error("Test DB must seed at least one user")
        legacyDeviceId = "legacy-${testUser.id}"

        // 이전 IT 잔존 row 제거 — 본 테스트가 다루는 3개 device bucket 한정.
        tokenRepo.findAll()
            .filter { it.deviceId == legacyDeviceId || it.deviceId == deviceA || it.deviceId == deviceB }
            .forEach { tokenRepo.deleteById(it.id) }
    }

    /**
     * STORM 재현 — deviceId 미전송 시 단일 `legacy-{userId}` chain 붕괴로
     * 한 기기의 오래된 토큰 재사용이 다른 기기의 활성 토큰까지 전멸시킨다.
     *
     * 시나리오:
     *   - 기기 A: legacy(raw) 토큰을 deviceId 없이 rotate → t1 (legacy bucket DB row 생성).
     *   - 기기 B: 같은 t1 을 deviceId 없이 rotate → t2 (t1 은 ROTATED revoke, t2 가 legacy bucket 활성).
     *   - grace window(5s) 경과: t1 의 revokedAt 을 10초 과거로 backdate.
     *   - 기기 A: 이미 revoke 된 t1 을 deviceId 없이 재-rotate → path(d) reuse-detection →
     *     `revokeAllForDevice(legacy-{userId})` 가 t2(기기 B 활성 토큰)까지 revoke = STORM.
     */
    @Test
    fun `STORM — deviceId 미전송 시 legacy bucket 붕괴로 한 토큰 reuse 가 다른 기기 토큰까지 전멸`() {
        // 기기 A: deviceId 없이 첫 rotate → legacy compat 경로로 legacy bucket DB row 생성.
        val rawLegacyToken = jwt.generateRefreshToken(testUser.id)
        val t1 = rotationService.rotate(rawLegacyToken, deviceId = null).newRefreshToken
        assertNotNull(t1)

        // 모든 토큰이 legacy-{userId} bucket 으로 붕괴했는지 확인.
        val afterT1 = tokenRepo.findActiveByUserAndDevice(testUser.id, legacyDeviceId, LocalDateTime.now())
        assertEquals(1, afterT1.size, "deviceId 미전송 토큰은 legacy-{userId} bucket 에 적재되어야 한다")

        // 기기 B: 같은 t1 을 deviceId 없이 rotate → 정상 회전(t1 ROTATED revoke, t2 활성).
        val t2 = rotationService.rotate(t1, deviceId = null).newRefreshToken
        assertNotEquals(t1, t2, "회전은 새 토큰을 발급해야 한다")

        val activeBeforeStorm = tokenRepo.findActiveByUserAndDevice(testUser.id, legacyDeviceId, LocalDateTime.now())
        assertEquals(1, activeBeforeStorm.size, "회전 후 legacy bucket 활성 토큰은 t2 하나여야 한다")

        // grace window 경과 시뮬레이션 — t1 의 revokedAt 을 10초 과거로 backdate.
        val revokedT1 = tokenRepo.findAll().first {
            it.deviceId == legacyDeviceId && it.revokedAt != null
        }
        revokedT1.revokedAt = LocalDateTime.now().minusSeconds(10)
        tokenRepo.save(revokedT1)

        // 기기 A: 이미 revoke 된 t1 재사용 → reuse-detection → 전체 legacy bucket revoke.
        assertThrows<UnauthorizedException> {
            rotationService.rotate(t1, deviceId = null)
        }

        // STORM 검증: legacy bucket 에 활성 토큰이 0 — 기기 B 의 t2 까지 전멸.
        val activeAfterStorm = tokenRepo.findActiveByUserAndDevice(testUser.id, legacyDeviceId, LocalDateTime.now())
        assertEquals(
            0, activeAfterStorm.size,
            "STORM: deviceId 미전송 시 한 토큰 reuse 가 legacy bucket 전체(기기 B 활성 토큰 포함)를 revoke 해야 한다",
        )
        val reuseRecorded = tokenRepo.findAll().any {
            it.deviceId == legacyDeviceId && it.revokeReason == RefreshTokenRevokeReason.REUSE_DETECTED
        }
        assertTrue(reuseRecorded, "REUSE_DETECTED 가 legacy bucket 에 기록되어야 한다")
    }

    /**
     * ISOLATION 대조 — deviceId 를 분리 전송하면 기기별 독립 chain 이 유지되어
     * 한 기기의 reuse-detection revoke 가 다른 기기에 영향을 주지 않는다 (storm 미발생).
     */
    @Test
    fun `ISOLATION — deviceId 분리 전송 시 기기 A reuse revoke 가 기기 B 에 무영향`() {
        // 기기 A·B 각각 독립 chain 으로 초기 발급.
        val tA1 = rotationService.issueInitial(testUser.id, deviceA)
        val tB1 = rotationService.issueInitial(testUser.id, deviceB)
        assertNotNull(tB1)

        // 기기 A 정상 회전 → tA1 revoke, tA2 활성.
        rotationService.rotate(tA1, deviceA)

        // grace window 경과 — 기기 A 의 revoked 토큰 backdate.
        val revokedA = tokenRepo.findAll().first { it.deviceId == deviceA && it.revokedAt != null }
        revokedA.revokedAt = LocalDateTime.now().minusSeconds(10)
        tokenRepo.save(revokedA)

        // 기기 A: revoke 된 tA1 재사용 → reuse-detection → deviceA chain 만 revoke.
        assertThrows<UnauthorizedException> {
            rotationService.rotate(tA1, deviceA)
        }

        // 기기 A chain 전멸 검증.
        val activeA = tokenRepo.findActiveByUserAndDevice(testUser.id, deviceA, LocalDateTime.now())
        assertEquals(0, activeA.size, "기기 A chain 은 reuse-detection 으로 전부 revoke 되어야 한다")

        // 기기 B 무영향 검증 — storm 미발생.
        val activeB = tokenRepo.findActiveByUserAndDevice(testUser.id, deviceB, LocalDateTime.now())
        assertEquals(
            1, activeB.size,
            "ISOLATION: deviceId 분리 시 기기 A 의 revoke 가 기기 B 활성 토큰에 영향을 주면 안 된다",
        )
    }
}
