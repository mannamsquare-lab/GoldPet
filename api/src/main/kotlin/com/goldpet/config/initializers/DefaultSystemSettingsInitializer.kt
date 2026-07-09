package com.goldpet.config.initializers

import com.goldpet.domain.common.service.SystemSettingService
import com.goldpet.domain.common.repository.SystemSettingRepository
import com.goldpet.domain.walk.service.PhotoUrlSigner
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile

@Configuration
@Profile("!codegen")
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

    @Bean
    fun seedGoldEconomyDefaults(): CommandLineRunner = CommandLineRunner {
        ensureDefault(
            "gold.payment.enabled",
            "false",
            "골드 결제(충전) 기능 마스터 토글. off면 POST /gold/charge 차단 + /gold/products 빈 리스트"
        )
        ensureDefault(
            "profile.boost.cost",
            "15",
            "프로필 부스트 골드 비용 (런치 튜닝: 30 -> 15)"
        )
        ensureDefault(
            "walk.reward.multiplier",
            "1.2",
            "산책 보상 배수 (ADR-001 보상 +20%). 기본 보상 테이블에 곱하고 반올림"
        )
        ensureDefault(
            "ai.profile.cost.image",
            "10",
            "AI 프로필 IMAGE 생성 골드 비용 (출시 도달 가능 경로만 설정화)"
        )
        ensureDefault(
            "signup.welcome.gold",
            "30",
            "회원가입 축하 골드 지급액 (0 이하면 지급 안 함)"
        )
    }

    private fun ensureDefault(key: String, value: String, description: String) {
        if (systemSettingRepository.findByKey(key) == null) {
            systemSettingService.setValue(key, value, description)
            log.info("Seeded default SystemSetting {}='{}'", key, value)
        }
    }
}
