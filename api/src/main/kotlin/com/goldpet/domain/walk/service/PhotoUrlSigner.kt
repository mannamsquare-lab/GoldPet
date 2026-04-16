package com.goldpet.domain.walk.service

import com.goldpet.domain.common.service.SystemSettingService
import com.goldpet.domain.file.service.FileService
import io.micrometer.core.instrument.Gauge
import io.micrometer.core.instrument.MeterRegistry
import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

/**
 * Signs walk-photo S3 keys into time-limited presigned HTTPS URLs.
 *
 * Guarded by:
 *  - UUID shape check (walk photos are stored as `{UUID}.{ext}` by FileService.storeFile)
 *  - `WALK_PHOTO_PRESIGNED_URL_ENABLED` flag via SystemSettingService (hot-switch across pods)
 *
 * Rejects and returns null for: null/blank input, inputs already prefixed with `http`
 * (public-bucket URLs), and any input that does not match the UUID filename pattern.
 * Non-UUID rejections log at WARN to surface injection attempts or schema drift.
 *
 * Registers `walk_photo_presigned_feature_flag_state` Prometheus gauge (1=on, 0=off)
 * polled on each scrape via SystemSettingService (Redis-backed, ~60 s propagation).
 */
@Component
class PhotoUrlSigner(
    private val fileService: FileService,
    private val systemSettingService: SystemSettingService,
    private val meterRegistry: MeterRegistry
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @PostConstruct
    fun registerMetrics() {
        Gauge.builder(GAUGE_FLAG_STATE, systemSettingService) { svc ->
            if (svc.getString(FLAG_KEY, FLAG_DEFAULT).equals("true", ignoreCase = true)) 1.0 else 0.0
        }
            .description("1 if WALK_PHOTO_PRESIGNED_URL_ENABLED flag is on across this pod, 0 if off")
            .register(meterRegistry)
    }

    fun signedUrlOrNull(imageKey: String?): String? {
        if (imageKey.isNullOrBlank()) return null
        if (imageKey.startsWith("http", ignoreCase = true)) return null
        if (!UUID_KEY_REGEX.matches(imageKey)) {
            log.warn("signedUrlOrNull rejected non-UUID key: {}", imageKey)
            return null
        }
        val enabled = systemSettingService
            .getString(FLAG_KEY, FLAG_DEFAULT)
            .equals("true", ignoreCase = true)
        if (!enabled) return null
        return fileService.getPresignedUrl(imageKey, PRESIGN_TTL_MINUTES)
    }

    companion object {
        const val FLAG_KEY = "WALK_PHOTO_PRESIGNED_URL_ENABLED"
        const val FLAG_DEFAULT = "false"
        const val PRESIGN_TTL_MINUTES = 30L
        const val GAUGE_FLAG_STATE = "walk_photo_presigned_feature_flag_state"

        val UUID_KEY_REGEX = Regex(
            "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\\.[a-zA-Z0-9]+)?$",
            RegexOption.IGNORE_CASE
        )
    }
}
