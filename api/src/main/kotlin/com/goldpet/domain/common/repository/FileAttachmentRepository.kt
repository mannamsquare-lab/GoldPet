package com.goldpet.domain.common.repository

import com.goldpet.domain.common.entity.FileAttachment
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

interface FileAttachmentRepository : JpaRepository<FileAttachment, Long> {
    fun findAllByUrlIn(urls: List<String>): List<FileAttachment>
    fun findByUrl(url: String): FileAttachment?

    @Query("SELECT f FROM FileAttachment f WHERE f.fileType = 'IMAGE' AND f.thumbnailUrl IS NULL AND f.mimeType <> 'image/gif'")
    fun findImagesWithoutVariants(pageable: Pageable): Page<FileAttachment>

    /**
     * T-chat-latency-v2 — GIF 이모티콘/이미지의 first-frame variant 1회성 백필 타겟.
     * 원본 generateVariants 는 GIF 를 skip 하지만, 이모티콘 picker 가 수백KB~수MB GIF 를
     * 직접 로드해 느려지는 문제를 해결하기 위해 static first-frame thumbnail 로 대체한다.
     */
    @Query("SELECT f FROM FileAttachment f WHERE f.fileType = 'IMAGE' AND f.mimeType = 'image/gif' AND f.thumbnailUrl IS NULL")
    fun findGifImagesWithoutVariants(): List<FileAttachment>

    /**
     * T0-6 retry query. Targets rows that the original backfill skip-marked (thumbnailUrl=url
     * or mediumUrl=url) plus partial-variant rows (viewerUrl NULL but thumbnailUrl set),
     * cooled off by `updatedAt < cutoff` so we don't infinitely re-process permanent failures.
     * Production cutoff is 7 days; tests may pass a narrower window.
     */
    @Query(
        "SELECT f FROM FileAttachment f " +
            "WHERE f.fileType = 'IMAGE' " +
            "AND f.mimeType <> 'image/gif' " +
            "AND (f.thumbnailUrl = f.url OR f.mediumUrl = f.url OR (f.viewerUrl IS NULL AND f.thumbnailUrl IS NOT NULL)) " +
            "AND f.updatedAt < :cutoff"
    )
    fun findImagesForRetry(@Param("cutoff") cutoff: LocalDateTime, pageable: Pageable): Page<FileAttachment>

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE file_attachments SET thumbnail_url = :thumbUrl, medium_url = :medUrl, width = :width, height = :height, updated_at = CURRENT_TIMESTAMP WHERE id = :id", nativeQuery = true)
    fun updateVariantUrls(
        @Param("id") id: Long,
        @Param("thumbUrl") thumbUrl: String,
        @Param("medUrl") medUrl: String,
        @Param("width") width: Int,
        @Param("height") height: Int
    )

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE file_attachments SET thumbnail_url = :thumbUrl, medium_url = :medUrl, viewer_url = :viewerUrl, width = :width, height = :height, updated_at = CURRENT_TIMESTAMP WHERE id = :id", nativeQuery = true)
    fun updateAllVariantUrls(
        @Param("id") id: Long,
        @Param("thumbUrl") thumbUrl: String?,
        @Param("medUrl") medUrl: String?,
        @Param("viewerUrl") viewerUrl: String?,
        @Param("width") width: Int,
        @Param("height") height: Int
    )

    /** T2: same as updateAllVariantUrls but also writes the three WebP variant columns. */
    @Modifying(clearAutomatically = true)
    @Transactional
    @Query(
        "UPDATE file_attachments SET " +
            "thumbnail_url = :thumbUrl, medium_url = :medUrl, viewer_url = :viewerUrl, " +
            "thumbnail_url_webp = :thumbWebpUrl, medium_url_webp = :medWebpUrl, viewer_url_webp = :viewerWebpUrl, " +
            "width = :width, height = :height, updated_at = CURRENT_TIMESTAMP " +
            "WHERE id = :id",
        nativeQuery = true
    )
    fun updateAllVariantUrlsWithWebp(
        @Param("id") id: Long,
        @Param("thumbUrl") thumbUrl: String?,
        @Param("medUrl") medUrl: String?,
        @Param("viewerUrl") viewerUrl: String?,
        @Param("thumbWebpUrl") thumbWebpUrl: String?,
        @Param("medWebpUrl") medWebpUrl: String?,
        @Param("viewerWebpUrl") viewerWebpUrl: String?,
        @Param("width") width: Int,
        @Param("height") height: Int
    )
}
