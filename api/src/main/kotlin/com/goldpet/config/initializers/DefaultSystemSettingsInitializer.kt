package com.goldpet.config.initializers

import com.goldpet.domain.common.service.SystemSettingService
import com.goldpet.domain.common.repository.SystemSettingRepository
import com.goldpet.domain.auth.service.DevLoginAccessPolicy
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


    /**
     * dev-login 접근 통제 기본값 (인증우회 차단).
     *
     * dev-login 은 비밀번호·SNS 인증 없이 토큰을 발급하므로, 셋 다 **fail-closed** 다.
     * 값이 없으면 정책이 거부하고, 여기서는 최초 1회만 기본값을 심는다(운영 중 변경은 덮어쓰지 않음).
     *
     * IP 기본값 = ufw SSH 허용목록과 동일한 오너 접속 IP + 로컬. 오너 IP 가 바뀌면 어드민/설정에서
     * 갱신한다(재배포 불필요 — setValue 가 캐시를 evict 한다).
     */
    @Bean
    fun seedDevLoginAccessDefaults(): CommandLineRunner = CommandLineRunner {
        ensureDefault(
            DevLoginAccessPolicy.KEY_ENABLED,
            "true",
            "dev-login 마스터 킬스위치. false 면 엔드포인트 전면 403 (재배포 없이 즉시 차단)"
        )
        ensureDefault(
            DevLoginAccessPolicy.KEY_ALLOWED_IPS,
            "115.79.198.72,211.207.145.74,113.161.75.215,220.117.201.51,127.0.0.1,::1",
            "dev-login 허용 IP/CIDR (콤마구분). 비어 있으면 전면 거부. 판정은 nginx 가 덮어쓰는 X-Real-IP 기준"
        )
        ensureDefault(
            DevLoginAccessPolicy.KEY_ALLOWED_EMAILS,
            "jioabang@kakao.com",
            "dev-login 으로 로그인 가능한 계정 이메일 (콤마구분). 비어 있으면 전면 거부. 미등재 이메일은 계정도 만들지 않는다"
        )
    }

    private fun ensureDefault(key: String, value: String, description: String) {
        if (systemSettingRepository.findByKey(key) == null) {
            systemSettingService.setValue(key, value, description)
            log.info("Seeded default SystemSetting {}='{}'", key, value)
        }
    }
}
