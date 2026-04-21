package com.goldpet.domain.common.service

import com.goldpet.IntegrationTestBase
import com.goldpet.domain.common.entity.FileAttachment
import com.goldpet.domain.common.repository.FileAttachmentRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.util.UUID

class FileAttachmentLookupServiceTest : IntegrationTestBase() {

    @Autowired
    lateinit var lookup: FileAttachmentLookupService

    @Autowired
    lateinit var repo: FileAttachmentRepository

    private val seededUrls = mutableListOf<String>()

    @AfterEach
    fun cleanup() {
        lookup.invalidateAll()
        if (seededUrls.isNotEmpty()) {
            val ids = repo.findAllByUrlIn(seededUrls).map { it.id }
            if (ids.isNotEmpty()) repo.deleteAllById(ids)
            seededUrls.clear()
        }
    }

    private fun seed(attachment: FileAttachment): FileAttachment {
        seededUrls += attachment.url
        return repo.save(attachment)
    }

    @Test
    fun `batchLookup 100 URL 에 대해 단일 IN 쿼리로 실행된다`() {
        // given: 서로 다른 FileAttachment 100개 seed
        val prefix = "https://test.example/batchlookup-${UUID.randomUUID()}"
        val urls = (1..100).map { idx ->
            val saved = seed(
                FileAttachment(
                    ownerUserId = 1L,
                    fileType = "IMAGE",
                    mimeType = "image/jpeg",
                    url = "$prefix-$idx.jpg",
                    viewerUrl = "$prefix-${idx}_viewer.jpg",
                    thumbnailUrl = "$prefix-${idx}_thumb.jpg",
                    mediumUrl = "$prefix-${idx}_medium.jpg"
                )
            )
            saved.url
        }
        repo.flush()
        lookup.invalidateAll()

        // when/then: Caffeine 비어있는 상태에서 호출 — IN 쿼리 1회만 실행되는지
        val result = withinStatementBudget(max = 1) {
            lookup.batchLookup(urls)
        }

        assertEquals(urls.size, result.size)
    }

    @Test
    fun `batchLookup 후 viewerUrlFor 는 Caffeine hit 로 DB 미조회`() {
        // given
        val url = "https://test.example/cache-warm-${UUID.randomUUID()}.jpg"
        val viewerUrl = "${url.removeSuffix(".jpg")}_viewer.jpg"
        seed(
            FileAttachment(
                ownerUserId = 1L,
                fileType = "IMAGE",
                mimeType = "image/jpeg",
                url = url,
                viewerUrl = viewerUrl
            )
        )
        repo.flush()

        // when: batch 로 캐시 warm
        lookup.batchLookup(listOf(url))

        // then: 후속 호출이 DB hit 0 회
        val resolvedUrl = withinStatementBudget(max = 0) {
            lookup.viewerUrlFor(url)
        }
        assertEquals(viewerUrl, resolvedUrl)
    }

    @Test
    fun `viewerUrlFor 매칭 없으면 원본 URL 반환`() {
        val url = "https://test.example/no-attachment-${UUID.randomUUID()}.jpg"
        // DB 에 없는 URL
        val result = lookup.viewerUrlFor(url)
        assertEquals(url, result)
    }

    @Test
    fun `viewerUrlFor viewer NULL 시 medium → thumbnail → 원본 순서 fallback`() {
        val url = "https://test.example/fallback-${UUID.randomUUID()}.jpg"
        seed(
            FileAttachment(
                ownerUserId = 1L,
                fileType = "IMAGE",
                mimeType = "image/jpeg",
                url = url,
                thumbnailUrl = "$url.thumb",
                mediumUrl = "$url.medium",
                viewerUrl = null
            )
        )
        repo.flush()
        lookup.invalidateAll()

        val medium = lookup.viewerUrlFor(url)
        assertEquals("$url.medium", medium)
    }

    @Test
    fun `invalidate 후 DB 재조회 수행`() {
        val url = "https://test.example/invalidate-${UUID.randomUUID()}.jpg"
        seed(
            FileAttachment(
                ownerUserId = 1L,
                fileType = "IMAGE",
                mimeType = "image/jpeg",
                url = url,
                viewerUrl = "$url.viewer"
            )
        )
        repo.flush()
        lookup.invalidateAll()

        // warm
        assertNotNull(lookup.viewerUrlFor(url))
        // invalidate
        lookup.invalidate(url)
        // 이제 다시 DB hit 필요
        val reResolved = withinStatementBudget(max = 1) {
            lookup.viewerUrlFor(url)
        }
        assertEquals("$url.viewer", reResolved)
    }
}
