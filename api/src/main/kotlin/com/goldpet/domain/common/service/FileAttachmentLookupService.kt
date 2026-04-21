package com.goldpet.domain.common.service

import com.github.benmanes.caffeine.cache.Cache
import com.github.benmanes.caffeine.cache.Caffeine
import com.goldpet.domain.common.entity.FileAttachment
import com.goldpet.domain.common.repository.FileAttachmentRepository
import org.springframework.stereotype.Service
import java.time.Duration

/**
 * T1-1.1 — URL → FileAttachment variant lookup with Caffeine cache.
 *
 * ## 설계
 * - 60s Caffeine TTL + 10k entry bound. 리스트 DTO 빌드 시 서비스 레이어에서
 *   `batchLookup(urls)` 로 미리 prefetch 해두면 후속 `viewerUrlFor` 는 전부 캐시 hit.
 * - Emoticon/Pet profile 이미지 변경 같은 수명 짧은 mutation 경로에서는 `invalidate(url)` 로 수동 제거.
 *
 * ## N+1 방지 규약 (계획 Section 3 T1-1)
 * 1. DTO mapper 내부에서 `viewerUrlFor` / `thumbnailUrlFor` 만 호출 — 단일 lookup 을 캐시로 흡수.
 * 2. 서비스 레이어가 **먼저** `batchLookup(allUrls)` 로 IN 쿼리 1회 실행 → Caffeine 에 warm.
 * 3. 통합 테스트는 `IntegrationTestBase.withinStatementBudget(max = 1)` 로 단일 SELECT 강제.
 *
 * ## Scope
 * - Public bucket URL (`https://s3.../goldpet-public/{uuid}.jpg`) — 안정적, 캐시 최적.
 * - Private bucket presigned URL (`?X-Amz-Signature=...`) — 60m 만료이므로 60s TTL 이면 충돌 무.
 *   signature 가 재발급될 때는 URL 문자열 자체가 바뀌므로 자연 캐시 miss → 재조회.
 */
@Service
class FileAttachmentLookupService(
    private val fileAttachmentRepository: FileAttachmentRepository,
) {
    private val cache: Cache<String, FileAttachment> = Caffeine.newBuilder()
        .maximumSize(MAX_CACHE_ENTRIES)
        .expireAfterWrite(Duration.ofSeconds(CACHE_TTL_SECONDS))
        .build()

    /**
     * 여러 URL 을 한 번의 IN 쿼리로 조회하고 Caffeine 에 warm.
     * DTO mapper 가 리스트 처리 시작 전에 서비스 레이어에서 반드시 1회 호출.
     *
     * @return 존재하는 FileAttachment 매핑. 조회 실패 URL 은 반환 Map 에서 누락.
     */
    fun batchLookup(urls: Collection<String?>): Map<String, FileAttachment> {
        val distinct = urls.asSequence()
            .filterNotNull()
            .filter { it.isNotBlank() }
            .distinct()
            .toList()
        if (distinct.isEmpty()) return emptyMap()

        val result = mutableMapOf<String, FileAttachment>()
        val missing = mutableListOf<String>()
        for (u in distinct) {
            val hit = cache.getIfPresent(u)
            if (hit != null) result[u] = hit else missing += u
        }

        if (missing.isNotEmpty()) {
            val rows = fileAttachmentRepository.findAllByUrlIn(missing)
            for (fa in rows) {
                cache.put(fa.url, fa)
                result[fa.url] = fa
            }
        }
        return result
    }

    /**
     * 단일 URL → viewer variant. 없으면 medium → thumbnail → 원본 순서 fallback.
     * DTO mapper 내부에서 주로 호출. `batchLookup` prefetch 로 warm 해두는 게 필수.
     */
    fun viewerUrlFor(url: String?): String? {
        if (url.isNullOrBlank()) return url
        val fa = resolve(url) ?: return url
        return fa.viewerUrl ?: fa.mediumUrl ?: fa.thumbnailUrl ?: fa.url
    }

    fun mediumUrlFor(url: String?): String? {
        if (url.isNullOrBlank()) return url
        val fa = resolve(url) ?: return url
        return fa.mediumUrl ?: fa.thumbnailUrl ?: fa.url
    }

    fun thumbnailUrlFor(url: String?): String? {
        if (url.isNullOrBlank()) return url
        val fa = resolve(url) ?: return url
        return fa.thumbnailUrl ?: fa.url
    }

    /** URL 업데이트 이벤트 (Emoticon/Pet 프로필 변경 등) 에서 수동 호출. */
    fun invalidate(url: String) {
        cache.invalidate(url)
    }

    fun invalidateAll() {
        cache.invalidateAll()
    }

    private fun resolve(url: String): FileAttachment? {
        val cached = cache.getIfPresent(url)
        if (cached != null) return cached
        val fromDb = fileAttachmentRepository.findByUrl(url) ?: return null
        cache.put(url, fromDb)
        return fromDb
    }

    companion object {
        private const val MAX_CACHE_ENTRIES: Long = 10_000
        private const val CACHE_TTL_SECONDS: Long = 60
    }
}
