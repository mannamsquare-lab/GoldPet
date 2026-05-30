package com.goldpet.domain.auth.service

import com.goldpet.config.jwt.JwtTokenProvider
import com.goldpet.domain.auth.entity.RefreshTokenRevokeReason
import com.goldpet.domain.auth.entity.UserRefreshToken
import com.goldpet.domain.auth.repository.UserRefreshTokenRepository
import com.goldpet.domain.common.exception.UnauthorizedException
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.MessageDigest
import java.time.Duration
import java.time.LocalDateTime

/**
 * V66: JWT refresh token rotation + reuse detection.
 *
 * 알고리즘:
 * 1. `validateRefreshToken` 통과 → token_hash (SHA-256) 계산.
 * 2. `findByTokenHash`:
 *    - **row 없음** → legacy compat: pre-V66 발급 token 또는 lazy init. 새 token 발급 + DB insert (parent=NULL).
 *    - **row 있고 revoked=false** → 정상 회전. 새 token 발급 + DB insert (parent=oldHash) + old revoke(ROTATED).
 *    - **row 있고 revoked=true**:
 *      * **grace window**: 동일 device_id 의 child token이 5초 내 발급되었으면 새 token 발급 (REUSE 면제, race 보호).
 *      * **reuse detected**: 그 외 — `revokeAllForDevice(REUSE_DETECTED)` + 401.
 *
 * 트랜잭션: rotation 전체를 단일 `@Transactional`로 묶음.
 * `revokeByTokenHash` 후 새 token row insert 가 함께 commit → race condition 시 한 쪽만 성공.
 */
@Service
class RefreshTokenRotationService(
    private val repo: UserRefreshTokenRepository,
    private val jwtTokenProvider: JwtTokenProvider,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    /**
     * Initial issue at login / signup. RotationService 가 호출되는 1순위 진입점.
     * 호출 측은 [issueInitial] 결과 token 을 클라이언트에 반환.
     */
    @Transactional
    fun issueInitial(
        userId: Long,
        deviceId: String,
        userAgent: String? = null,
        ipAddress: String? = null,
    ): String = persistNewToken(userId, deviceId, parentHash = null, userAgent, ipAddress)

    /**
     * Rotate. 반환은 (newRefreshToken, userId).
     * 검증 실패 / reuse 시 [UnauthorizedException].
     *
     * `noRollbackFor = UnauthorizedException`: reuse-detection 경로(d)는
     * [revokeAllForDevice] 로 device chain 전체를 revoke 한 직후 401 을 던진다.
     * 기본 rollback 정책이면 이 revoke 가 함께 롤백되어 보안 조치가 무효화되므로,
     * UnauthorizedException 발생 시에도 revoke 가 commit 되도록 명시한다.
     */
    @Transactional(noRollbackFor = [UnauthorizedException::class])
    fun rotate(
        oldToken: String,
        deviceId: String?,
        userAgent: String? = null,
        ipAddress: String? = null,
    ): RotationResult {
        if (!jwtTokenProvider.validateRefreshToken(oldToken)) {
            throw UnauthorizedException("Invalid refresh token")
        }
        val userId = jwtTokenProvider.getUserIdFromRefreshToken(oldToken)
        val oldHash = hashToken(oldToken)
        val now = LocalDateTime.now()
        val resolvedDeviceId = deviceId?.takeIf { it.isNotBlank() } ?: "legacy-$userId"

        val existing = repo.findByTokenHash(oldHash).orElse(null)

        // (a) Legacy compat: pre-V66 token 또는 lazy init.
        if (existing == null) {
            val newToken = persistNewToken(userId, resolvedDeviceId, parentHash = null, userAgent, ipAddress)
            return RotationResult(newToken, userId)
        }

        // (b) 정상 회전.
        if (existing.revokedAt == null) {
            repo.revokeByTokenHash(oldHash, now, RefreshTokenRevokeReason.ROTATED)
            val newToken = persistNewToken(existing.userId, existing.deviceId, parentHash = oldHash, userAgent, ipAddress)
            return RotationResult(newToken, existing.userId)
        }

        // (c) revoked: grace window 또는 reuse detection.
        val revokedAt = existing.revokedAt!!
        val child = repo.findByParentTokenHash(oldHash).orElse(null)
        val withinGrace = child != null
            && child.deviceId == existing.deviceId
            && Duration.between(revokedAt, now).seconds <= GRACE_WINDOW_SECONDS

        if (withinGrace) {
            // 동일 device 가 5초 race 로 두 번 호출했을 가능성. REUSE 면제 + 새 token 발급 (chain 분기).
            log.info("Refresh token grace-window hit for user={} device={}", userId, existing.deviceId)
            val newToken = persistNewToken(existing.userId, existing.deviceId, parentHash = child!!.tokenHash, userAgent, ipAddress)
            return RotationResult(newToken, existing.userId)
        }

        // (d) REUSE DETECTED — 해당 device chain 전체 revoke.
        val revoked = repo.revokeAllForDevice(existing.userId, existing.deviceId, now, RefreshTokenRevokeReason.REUSE_DETECTED)
        log.warn(
            "Refresh token reuse detected — user={} device={} revoked_count={}",
            existing.userId, existing.deviceId, revoked,
        )
        throw UnauthorizedException("Refresh token reuse detected — all tokens for this device revoked")
    }

    private fun persistNewToken(
        userId: Long,
        deviceId: String,
        parentHash: String?,
        userAgent: String?,
        ipAddress: String?,
    ): String {
        val newToken = jwtTokenProvider.generateRefreshToken(userId)
        val newHash = hashToken(newToken)
        val expiresAt = jwtTokenProvider.getRefreshExpiry(newToken)
        repo.save(
            UserRefreshToken(
                userId = userId,
                deviceId = deviceId,
                tokenHash = newHash,
                parentTokenHash = parentHash,
                expiresAt = expiresAt,
                userAgent = userAgent,
                ipAddress = ipAddress,
            )
        )
        return newToken
    }

    private fun hashToken(token: String): String {
        val md = MessageDigest.getInstance("SHA-256")
        return md.digest(token.toByteArray(Charsets.UTF_8)).joinToString("") { "%02x".format(it) }
    }

    data class RotationResult(val newRefreshToken: String, val userId: Long)

    companion object {
        const val GRACE_WINDOW_SECONDS: Long = 5
    }
}
