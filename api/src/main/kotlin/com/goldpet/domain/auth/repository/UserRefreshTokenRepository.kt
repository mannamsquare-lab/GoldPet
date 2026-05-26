package com.goldpet.domain.auth.repository

import com.goldpet.domain.auth.entity.RefreshTokenRevokeReason
import com.goldpet.domain.auth.entity.UserRefreshToken
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.Optional

@Repository
interface UserRefreshTokenRepository : JpaRepository<UserRefreshToken, Long> {

    fun findByTokenHash(tokenHash: String): Optional<UserRefreshToken>

    /**
     * Child token issued via rotation from a given parent.
     * Used by grace-window logic: returns the new token that was issued in response to
     * the parent's previous rotation, so a same-device retry within 5s can return it idempotently.
     */
    fun findByParentTokenHash(parentTokenHash: String): Optional<UserRefreshToken>

    /**
     * Active (not revoked, not expired) tokens for a (user, device).
     * Used for diagnostics / logout-all-on-device.
     */
    @Query(
        """
        SELECT t FROM UserRefreshToken t
         WHERE t.userId = :userId
           AND t.deviceId = :deviceId
           AND t.revokedAt IS NULL
           AND t.expiresAt > :now
        """
    )
    fun findActiveByUserAndDevice(
        @Param("userId") userId: Long,
        @Param("deviceId") deviceId: String,
        @Param("now") now: LocalDateTime,
    ): List<UserRefreshToken>

    /**
     * Revoke ALL active tokens for (user_id, device_id). 사용처:
     *  - reuse detection (이미 revoked된 token 재사용 시도 → 해당 device chain 전체 revoke)
     *  - 사용자 명시 로그아웃 (LOGOUT)
     *  - Admin 강제 로그아웃 (ADMIN_FORCE)
     */
    @Modifying
    @Query(
        """
        UPDATE UserRefreshToken t
           SET t.revokedAt = :now, t.revokeReason = :reason
         WHERE t.userId = :userId
           AND t.deviceId = :deviceId
           AND t.revokedAt IS NULL
        """
    )
    fun revokeAllForDevice(
        @Param("userId") userId: Long,
        @Param("deviceId") deviceId: String,
        @Param("now") now: LocalDateTime,
        @Param("reason") reason: RefreshTokenRevokeReason,
    ): Int

    /** 단일 token revoke (회전 시 parent revoke 용). */
    @Modifying
    @Query(
        """
        UPDATE UserRefreshToken t
           SET t.revokedAt = :now, t.revokeReason = :reason
         WHERE t.tokenHash = :tokenHash
           AND t.revokedAt IS NULL
        """
    )
    fun revokeByTokenHash(
        @Param("tokenHash") tokenHash: String,
        @Param("now") now: LocalDateTime,
        @Param("reason") reason: RefreshTokenRevokeReason,
    ): Int

    /** 만료된 token 정리 (cron). */
    @Modifying
    @Query("DELETE FROM UserRefreshToken t WHERE t.expiresAt < :now")
    fun deleteExpired(@Param("now") now: LocalDateTime): Int
}
