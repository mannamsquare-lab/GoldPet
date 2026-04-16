package com.goldpet.domain.walk.service

import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.AmazonS3Exception
import com.amazonaws.services.s3.model.ObjectMetadata
import com.goldpet.domain.file.service.FileService
import com.goldpet.domain.walk.entity.WalkSpotType
import com.goldpet.domain.walk.repository.WalkSpotRepository
import net.coobird.thumbnailator.Thumbnails
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.awt.image.BufferedImage
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO

/**
 * Per-row backfill for walk_spots variant keys. Lives in its own bean so
 * REQUIRES_NEW is honored (cross-bean call enters a Spring AOP proxy).
 *
 * Invariant: DB commit only after all S3 PUTs succeed — a pod crash mid-PUT
 * leaves the row eligible for the next sweep.
 */
@Service
class WalkSpotBackfillWorker(
    private val walkSpotRepository: WalkSpotRepository,
    private val amazonS3: AmazonS3,
    @Value("\${S3_PRIVATE_BUCKET_NAME:goldpet-private}") private val privateBucketName: String
) {
    private val log = LoggerFactory.getLogger(javaClass)

    data class BatchResult(
        val total: Long,
        val processed: Int,
        val skipped: Int,
        val failed: Int
    )

    data class ProcessResult(val outcome: Outcome) {
        enum class Outcome { PROCESSED, SKIPPED, FAILED, NOT_FOUND }
    }

    private val variants = listOf(
        Triple("_thumb", 200, 0.80),
        Triple("_viewer", 1600, 0.82)
    )

    /**
     * Processes a single walk_spot row. REQUIRES_NEW so one failure does not roll back
     * the caller's batch-level bookkeeping.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    fun processRow(spotId: Long, dryRun: Boolean): ProcessResult {
        val spot = walkSpotRepository.findById(spotId).orElse(null)
            ?: return ProcessResult(ProcessResult.Outcome.NOT_FOUND)

        val rawKey = spot.imageUrl
        if (rawKey.isNullOrBlank() || spot.type != WalkSpotType.PHOTO) {
            return ProcessResult(ProcessResult.Outcome.SKIPPED)
        }
        if (spot.imageKeyViewer != null) {
            return ProcessResult(ProcessResult.Outcome.SKIPPED)
        }

        try {
            val s3Object = amazonS3.getObject(privateBucketName, rawKey)
            val image: BufferedImage? = s3Object.objectContent.use { ImageIO.read(it) }
            if (image == null) {
                if (!dryRun) {
                    // Retry-prevention: pin to original key so the sweep does not re-pick this row.
                    spot.imageKeyViewer = rawKey
                    spot.imageKeyThumb = rawKey
                }
                return ProcessResult(ProcessResult.Outcome.SKIPPED)
            }

            val baseFilename = rawKey.substringBeforeLast(".")
            var viewerKey: String? = null
            var thumbKey: String? = null
            // Always generate both variants. Thumbnailator never upscales, so when the
            // source is already below maxDim the result preserves source dimensions —
            // the savings come from JPEG re-encoding a lossless PNG (e.g. 1200x900 PNG
            // ~3MB → 1200x900 JPEG ~250KB, a ~12x reduction). Without this, any walk
            // photo whose longSide is below maxDim fell back to the raw original and
            // produced the "swipe hangs on 10/51" lag on iOS WKWebView.

            for ((suffix, maxDim, quality) in variants) {
                val variantFilename = "$baseFilename$suffix.jpg"
                val out = ByteArrayOutputStream()
                Thumbnails.of(image)
                    .size(maxDim, maxDim)
                    .outputFormat("JPEG")
                    .outputQuality(quality)
                    .toOutputStream(out)
                val bytes = out.toByteArray()
                if (!dryRun) {
                    val metadata = ObjectMetadata().apply {
                        contentType = "image/jpeg"
                        contentLength = bytes.size.toLong()
                    }
                    amazonS3.putObject(privateBucketName, variantFilename, ByteArrayInputStream(bytes), metadata)
                }
                when (suffix) {
                    "_thumb" -> thumbKey = variantFilename
                    "_viewer" -> viewerKey = variantFilename
                }
            }

            if (dryRun) return ProcessResult(ProcessResult.Outcome.PROCESSED)

            // If short-side below every threshold, fall back to original key so we don't sweep forever.
            spot.imageKeyViewer = viewerKey ?: rawKey
            spot.imageKeyThumb = thumbKey ?: rawKey
            return ProcessResult(ProcessResult.Outcome.PROCESSED)
        } catch (e: AmazonS3Exception) {
            // 404 NoSuchKey / 403 forbidden: the original object is permanently unreachable.
            // Pin the keys to rawKey so the sweep does not re-pick this row forever.
            if (e.statusCode == 404 || e.statusCode == 403) {
                log.warn("Walk spot backfill skipping spotId={} (S3 {}): {}", spotId, e.statusCode, e.errorCode)
                if (!dryRun) {
                    spot.imageKeyViewer = rawKey
                    spot.imageKeyThumb = rawKey
                }
                return ProcessResult(ProcessResult.Outcome.SKIPPED)
            }
            // Transient S3 error (5xx, throttling) — leave row eligible for the next sweep.
            log.warn("Walk spot backfill transient S3 error for spotId={} status={}: {}", spotId, e.statusCode, e.message, e)
            return ProcessResult(ProcessResult.Outcome.FAILED)
        } catch (e: Exception) {
            log.warn("Walk spot backfill failed for spotId={}: {}", spotId, e.message, e)
            return ProcessResult(ProcessResult.Outcome.FAILED)
        }
    }

    /**
     * Batch sweep driver. Queries eligible rows and calls [processRow] for each — the
     * cross-bean call path is what lets REQUIRES_NEW actually start a new transaction.
     */
    fun backfillBatch(batchSize: Int, dryRun: Boolean): BatchResult {
        val pageable = org.springframework.data.domain.PageRequest.of(0, batchSize)
        val page = walkSpotRepository.findSpotsWithoutVariantKeys(pageable)
        val total = page.totalElements
        var processed = 0
        var skipped = 0
        var failed = 0
        for (spot in page.content) {
            when (processRow(spot.id, dryRun).outcome) {
                ProcessResult.Outcome.PROCESSED -> processed++
                ProcessResult.Outcome.SKIPPED, ProcessResult.Outcome.NOT_FOUND -> skipped++
                ProcessResult.Outcome.FAILED -> failed++
            }
        }
        return BatchResult(total, processed, skipped, failed)
    }

}
