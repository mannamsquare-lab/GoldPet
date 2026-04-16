package com.goldpet.config.initializers

import com.goldpet.domain.common.service.SystemSettingService
import com.goldpet.domain.common.repository.SystemSettingRepository
import com.goldpet.domain.walk.service.PhotoUrlSigner
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class DefaultSystemSettingsInitializer(
    private val systemSettingService: SystemSettingService,
    private val systemSettingRepository: SystemSettingRepository
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Bean
    fun seedWalkPhotoVariantFlags(): CommandLineRunner = CommandLineRunner {
        ensureDefault(
            PhotoUrlSigner.FLAG_VARIANTS_KEY,
            PhotoUrlSigner.FLAG_VARIANTS_DEFAULT,
            "Gate for serving _viewer/_thumb variant URLs on walk photos (flip ON after G1 backfill gate)"
        )
        ensureDefault(
            PhotoUrlSigner.FLAG_SIGNER_CACHE_KEY,
            "false",
            "Per-request Caffeine cache for presigned URLs (opt-in, flip ON only if JMH p95 regresses)"
        )
    }

    private fun ensureDefault(key: String, value: String, description: String) {
        if (systemSettingRepository.findByKey(key) == null) {
            systemSettingService.setValue(key, value, description)
            log.info("Seeded default SystemSetting {}='{}'", key, value)
        }
    }
}
