package com.goldpet.domain.file.service

import com.amazonaws.HttpMethod
import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest
import com.amazonaws.services.s3.model.ObjectMetadata
import com.drew.imaging.ImageMetadataReader
import com.drew.metadata.exif.GpsDirectory
import com.goldpet.domain.common.exception.*
import io.micrometer.core.instrument.MeterRegistry
import net.coobird.thumbnailator.Thumbnails
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Lazy
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionSynchronization
import org.springframework.transaction.support.TransactionSynchronizationManager
import org.springframework.web.multipart.MultipartFile
import java.awt.image.BufferedImage
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.util.Date
import java.util.UUID
import java.util.concurrent.RejectedExecutionException
import javax.imageio.ImageIO

private const val MAX_IMAGE_SIZE = 10 * 1024 * 1024L // 10MB
private val ALLOWED_IMAGE_TYPES = setOf("image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml")

enum class StorageBucket {
    PUBLIC,  // Profile images, pet images - directly accessible via public URL
    PRIVATE  // Chat images, community posts - requires presigned URL
}

data class ImageVariant(
    val suffix: String,      // e.g., "_thumb", "_medium"
    val maxDimension: Int,   // max short-side pixels
    val quality: Double      // 0.0 - 1.0
)

data class ProcessedImage(
    val bytes: ByteArray,
    val bufferedImage: BufferedImage?,  // null for non-images or decode failures
    val width: Int?,
    val height: Int?
)

@Service
class FileService(
    private val amazonS3: AmazonS3,
    @Value("\${S3_PUBLIC_BUCKET_NAME:goldpet-public}") private val publicBucketName: String,
    @Value("\${S3_PRIVATE_BUCKET_NAME:goldpet-private}") private val privateBucketName: String,
    @Value("\${S3_PUBLIC_ENDPOINT:http://localhost:9100}") private val publicEndpoint: String,
    @Value("\${S3_ENDPOINT:http://localhost:9100}") private val s3Endpoint: String,
    private val fileAttachmentRepository: com.goldpet.domain.common.repository.FileAttachmentRepository,
    @org.springframework.beans.factory.annotation.Qualifier("variantExecutor")
    private val variantExecutor: ThreadPoolTaskExecutor,
    private val meterRegistry: MeterRegistry,
    @Lazy private val walkSpotBackfillWorker: com.goldpet.domain.walk.service.WalkSpotBackfillWorker
) {
    private val log = LoggerFactory.getLogger(javaClass)

    private val IMAGE_VARIANTS = listOf(
        ImageVariant("_thumb", 200, 0.80),
        ImageVariant("_medium", 600, 0.85),
        ImageVariant("_viewer", 1600, 0.82)
    )

    init {
        ensureBucket(publicBucketName, isPublic = true)
        ensureBucket(privateBucketName, isPublic = false)
    }

    private fun ensureBucket(bucket: String, isPublic: Boolean) {
        try {
            if (!amazonS3.doesBucketExistV2(bucket)) {
                amazonS3.createBucket(bucket)
            }
            if (isPublic) {
                val policy = """
                {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Sid": "PublicReadGetObject",
                            "Effect": "Allow",
                            "Principal": "*",
                            "Action": "s3:GetObject",
                            "Resource": "arn:aws:s3:::$bucket/*"
                        }
                    ]
                }
                """.trimIndent()
                amazonS3.setBucketPolicy(bucket, policy)
            }
        } catch (e: Exception) {
            log.warn("S3/MinIO bucket setup failed for '{}': {}", bucket, e.message)
        }
    }

    /**
     * Determines which bucket to use based on upload category.
     * PUBLIC: profile, pet, avatar images (directly accessible)
     * PRIVATE: chat, community, and all other uploads (presigned URL required)
     */
    private fun determineBucket(category: String?): StorageBucket {
        return when (category?.lowercase()) {
            "profile", "pet", "avatar", "community", "notice", "ai-profile", "chat", "badge" -> StorageBucket.PUBLIC
            else -> StorageBucket.PRIVATE
        }
    }

    /**
     * Allowlist for variant generation. Explicit scope to prevent silent scope leak:
     * PUBLIC bucket (all existing PUBLIC categories) + walk-photo uploads (category == null).
     */
    private fun needsVariants(category: String?, bucket: StorageBucket): Boolean =
        bucket == StorageBucket.PUBLIC || category == null

    private fun validateImageFile(file: MultipartFile) {
        if (file.size > MAX_IMAGE_SIZE) {
            throw BadRequestException("File size exceeds maximum allowed size of 10MB")
        }
        val contentType = file.contentType?.lowercase()
        if (contentType == null || contentType !in ALLOWED_IMAGE_TYPES) {
            throw BadRequestException("Unsupported file type: $contentType. Allowed types: ${ALLOWED_IMAGE_TYPES.joinToString()}")
        }
    }

    /**
     * Decode the image once: strip EXIF GPS (JPEG only), decode BufferedImage, read dimensions.
     * Returns ProcessedImage so callers can reuse the decoded BufferedImage without re-reading.
     */
    private fun processImageFile(originalBytes: ByteArray, mimeType: String): ProcessedImage {
        if (!mimeType.startsWith("image/")) {
            return ProcessedImage(originalBytes, null, null, null)
        }

        // Strip EXIF GPS for JPEG
        val strippedBytes = if (mimeType == "image/jpeg") {
            stripExifGpsData(originalBytes)
        } else {
            originalBytes
        }

        // Decode once — used for dimensions + variant generation
        val image = try {
            ImageIO.read(ByteArrayInputStream(strippedBytes))
        } catch (e: Exception) {
            log.warn("Failed to decode image: ${e.message}")
            null
        }

        return ProcessedImage(
            bytes = strippedBytes,
            bufferedImage = image,
            width = image?.width,
            height = image?.height
        )
    }

    private fun stripExifGpsData(fileBytes: ByteArray): ByteArray {
        return try {
            val metadata = ImageMetadataReader.readMetadata(ByteArrayInputStream(fileBytes))
            val gpsDirectory = metadata.getFirstDirectoryOfType(GpsDirectory::class.java)
            if (gpsDirectory == null || gpsDirectory.isEmpty) return fileBytes
            val image: BufferedImage = ImageIO.read(ByteArrayInputStream(fileBytes)) ?: return fileBytes
            val outputStream = ByteArrayOutputStream()
            ImageIO.write(image, "jpg", outputStream)
            outputStream.toByteArray()
        } catch (e: Exception) {
            log.warn("Failed to strip EXIF data: ${e.message}")
            fileBytes
        }
    }

    /**
     * Generate thumbnail and medium WebP variants from a pre-decoded BufferedImage.
     * Skips GIFs (animated). Skips variants where the image is already smaller than the threshold.
     */
    private fun generateVariants(
        image: BufferedImage,
        baseFilename: String,
        mimeType: String,
        bucket: String
    ): Map<String, String> {
        if (mimeType == "image/gif") return emptyMap()

        val urls = mutableMapOf<String, String>()
        val shortSide = minOf(image.width, image.height)

        for (variant in IMAGE_VARIANTS) {
            if (shortSide <= variant.maxDimension) continue  // Already smaller than threshold

            val variantFilename = "${baseFilename}${variant.suffix}.jpg"
            val output = ByteArrayOutputStream()

            Thumbnails.of(image)
                .size(variant.maxDimension, variant.maxDimension)
                .outputFormat("JPEG")
                .outputQuality(variant.quality)
                .toOutputStream(output)

            val variantBytes = output.toByteArray()
            val variantMetadata = ObjectMetadata().apply {
                contentType = "image/jpeg"
                contentLength = variantBytes.size.toLong()
            }
            amazonS3.putObject(bucket, variantFilename, ByteArrayInputStream(variantBytes), variantMetadata)

            val url = "$publicEndpoint/$bucket/$variantFilename"
            urls[variant.suffix.removePrefix("_")] = url  // "thumb" -> url, "medium" -> url
        }
        return urls
    }

    /**
     * Generate variants and persist them directly to the FileAttachment row.
     * Runs OUTSIDE any outer transaction (submitted via variantExecutor post-commit).
     * For PRIVATE bucket, stores raw S3 keys in variant columns (callers presign on read).
     * For PUBLIC bucket, stores full HTTPS URLs.
     */
    fun generateVariantsRaw(
        attachmentId: Long,
        image: BufferedImage,
        baseFilename: String,
        mimeType: String,
        bucket: String,
        isPublic: Boolean
    ) {
        if (mimeType == "image/gif") return
        val results = mutableMapOf<String, String>()
        val shortSide = minOf(image.width, image.height)

        for (variant in IMAGE_VARIANTS) {
            if (shortSide <= variant.maxDimension) continue

            val variantFilename = "${baseFilename}${variant.suffix}.jpg"
            val output = ByteArrayOutputStream()

            Thumbnails.of(image)
                .size(variant.maxDimension, variant.maxDimension)
                .outputFormat("JPEG")
                .outputQuality(variant.quality)
                .toOutputStream(output)

            val variantBytes = output.toByteArray()
            val variantMetadata = ObjectMetadata().apply {
                contentType = "image/jpeg"
                contentLength = variantBytes.size.toLong()
            }
            amazonS3.putObject(bucket, variantFilename, ByteArrayInputStream(variantBytes), variantMetadata)

            val stored = if (isPublic) "$publicEndpoint/$bucket/$variantFilename" else variantFilename
            results[variant.suffix.removePrefix("_")] = stored
        }

        if (results.isEmpty()) return
        fileAttachmentRepository.updateAllVariantUrls(
            id = attachmentId,
            thumbUrl = results["thumb"],
            medUrl = results["medium"],
            viewerUrl = results["viewer"],
            width = image.width,
            height = image.height
        )
    }

    /**
     * Store a file and route it to the correct bucket based on category.
     *
     * @param file      the uploaded file
     * @param userId    owner user ID
     * @param category  upload context: "profile", "pet", "avatar" -> public bucket;
     *                  anything else (null, "chat", "community", ...) -> private bucket
     * @return FileAttachment with url:
     *         - public bucket: direct public URL
     *         - private bucket: the file key (use getPresignedUrl() to obtain a time-limited URL)
     */
    @org.springframework.transaction.annotation.Transactional
    fun storeFile(
        file: MultipartFile,
        userId: Long,
        category: String? = null
    ): com.goldpet.domain.common.entity.FileAttachment {
        try {
            if (file.isEmpty) {
                throw RuntimeException("Failed to store empty file.")
            }
            val originalFilename = file.originalFilename ?: "unknown"
            val extension = originalFilename.substringAfterLast(".", "")
            val newFilename = "${UUID.randomUUID()}.$extension"

            val mimeType = file.contentType ?: "application/octet-stream"

            if (mimeType.startsWith("image/")) {
                validateImageFile(file)
            }

            // Decode image once: strip EXIF GPS + read BufferedImage + dimensions
            val processed = processImageFile(file.bytes, mimeType)

            val metadata = ObjectMetadata().apply {
                contentType = mimeType
                contentLength = processed.bytes.size.toLong()
            }

            val bucket = determineBucket(category)
            val targetBucket = if (bucket == StorageBucket.PUBLIC) publicBucketName else privateBucketName

            amazonS3.putObject(targetBucket, newFilename, ByteArrayInputStream(processed.bytes), metadata)

            // Public files get a direct URL; private files store only the key
            val fileUrl = if (bucket == StorageBucket.PUBLIC) {
                "$publicEndpoint/$targetBucket/$newFilename"
            } else {
                newFilename  // callers must use getPresignedUrl(fileKey) for access
            }

            val fileType = when {
                mimeType.startsWith("image/") -> "IMAGE"
                mimeType.startsWith("video/") -> "VIDEO"
                mimeType.startsWith("audio/") -> "AUDIO"
                else -> "FILE"
            }

            val fileAttachment = com.goldpet.domain.common.entity.FileAttachment(
                ownerUserId = userId,
                fileType = fileType,
                mimeType = mimeType,
                url = fileUrl,
                originalFileName = originalFilename,
                sizeBytes = file.size,
                width = processed.width,
                height = processed.height,
                thumbnailUrl = null,
                mediumUrl = null,
                viewerUrl = null
            )
            val saved = fileAttachmentRepository.save(fileAttachment)

            // Variants are generated POST-COMMIT so storeFile's @Transactional boundary
            // is not held during Thumbnailator + S3 PUT latency.
            // IMPORTANT: do NOT capture the BufferedImage in the closure — with queueCapacity=200
            // the heap could retain 200 × ~50MB = 10GB of decoded images.
            // Re-fetch bytes from S3 inside the async task (scheduler DLQ sweep uses the same pattern).
            if (processed.bufferedImage != null
                && mimeType != "image/gif"
                && needsVariants(category, bucket)
            ) {
                val attachmentId = saved.id
                val baseFilename = newFilename.substringBeforeLast(".")
                val isPublic = bucket == StorageBucket.PUBLIC
                val s3Key = newFilename
                TransactionSynchronizationManager.registerSynchronization(object : TransactionSynchronization {
                    override fun afterCommit() {
                        try {
                            variantExecutor.submit {
                                try {
                                    val s3Object = amazonS3.getObject(targetBucket, s3Key)
                                    val reloaded: BufferedImage? = s3Object.objectContent.use { ImageIO.read(it) }
                                    if (reloaded == null) {
                                        log.warn("async variant-gen could not decode S3 object for attachment={} key={}", attachmentId, s3Key)
                                        return@submit
                                    }
                                    generateVariantsRaw(
                                        attachmentId = attachmentId,
                                        image = reloaded,
                                        baseFilename = baseFilename,
                                        mimeType = mimeType,
                                        bucket = targetBucket,
                                        isPublic = isPublic
                                    )
                                } catch (e: Exception) {
                                    log.warn("async variant-gen failed for attachment={}: {}", attachmentId, e.message, e)
                                }
                            }
                        } catch (e: RejectedExecutionException) {
                            meterRegistry.counter(
                                "walk_photo_variant_rejected_total",
                                "reason", "queue_full"
                            ).increment()
                            log.warn(
                                "variant-gen task REJECTED for attachment={}; " +
                                    "will be reclaimed by WalkSpotVariantSyncScheduler DLQ sweep",
                                attachmentId, e
                            )
                        }
                    }
                })
            }

            return saved
        } catch (e: IllegalArgumentException) {
            throw e
        } catch (e: IOException) {
            throw RuntimeException("Failed to store file.", e)
        } catch (e: Exception) {
            throw RuntimeException("Failed to upload to S3.", e)
        }
    }

    data class BackfillResult(
        val total: Long,
        val processed: Int,
        val skipped: Int,
        val failed: Int,
        val durationMs: Long
    )

    enum class BackfillScope { ALL, FILE_ATTACHMENTS, WALK_SPOTS }

    /**
     * Scoped backfill. Per-row work executes through `WalkSpotBackfillWorker` (REQUIRES_NEW)
     * so pod restarts mid-batch leave committed rows intact.
     * NO @Transactional on this outer method — the worker beans own their own tx.
     */
    fun backfillVariants(scope: BackfillScope, batchSize: Int, dryRun: Boolean = false): BackfillResult {
        return when (scope) {
            BackfillScope.FILE_ATTACHMENTS -> backfillFileAttachments(batchSize)
            BackfillScope.WALK_SPOTS -> backfillWalkSpots(batchSize, dryRun)
            BackfillScope.ALL -> {
                val a = backfillFileAttachments(batchSize)
                val b = backfillWalkSpots(batchSize, dryRun)
                BackfillResult(
                    total = a.total + b.total,
                    processed = a.processed + b.processed,
                    skipped = a.skipped + b.skipped,
                    failed = a.failed + b.failed,
                    durationMs = a.durationMs + b.durationMs
                )
            }
        }
    }

    private fun backfillWalkSpots(batchSize: Int, dryRun: Boolean): BackfillResult {
        val startMs = System.currentTimeMillis()
        val result = walkSpotBackfillWorker.backfillBatch(batchSize, dryRun)
        return BackfillResult(
            total = result.total,
            processed = result.processed,
            skipped = result.skipped,
            failed = result.failed,
            durationMs = System.currentTimeMillis() - startMs
        )
    }

    @org.springframework.transaction.annotation.Transactional
    fun backfillVariants(batchSize: Int): BackfillResult = backfillFileAttachments(batchSize)

    @org.springframework.transaction.annotation.Transactional
    private fun backfillFileAttachments(batchSize: Int): BackfillResult {
        val startMs = System.currentTimeMillis()
        val pageable = org.springframework.data.domain.PageRequest.of(0, batchSize)
        val page = fileAttachmentRepository.findImagesWithoutVariants(pageable)
        val total = page.totalElements
        var processed = 0
        var skipped = 0
        var failed = 0

        for (fileAttachment in page.content) {
            try {
                val uri = java.net.URI(fileAttachment.url)
                val pathParts = uri.path.removePrefix("/").split("/", limit = 2)
                if (pathParts.size < 2) {
                    // URL 파싱 실패 → 원본 URL로 채워서 재조회 방지
                    fileAttachmentRepository.updateVariantUrls(
                        id = fileAttachment.id, thumbUrl = fileAttachment.url, medUrl = fileAttachment.url,
                        width = fileAttachment.width ?: 0, height = fileAttachment.height ?: 0
                    )
                    skipped++; continue
                }
                val bucket = pathParts[0]
                val key = pathParts[1]

                val s3Object = amazonS3.getObject(bucket, key)
                val image = ImageIO.read(s3Object.objectContent)
                if (image == null) {
                    // 디코딩 실패 → 원본 URL로 채워서 재조회 방지
                    fileAttachmentRepository.updateVariantUrls(
                        id = fileAttachment.id, thumbUrl = fileAttachment.url, medUrl = fileAttachment.url,
                        width = fileAttachment.width ?: 0, height = fileAttachment.height ?: 0
                    )
                    skipped++; continue
                }

                val variantUrls = generateVariants(
                    image = image,
                    baseFilename = key.substringBeforeLast("."),
                    mimeType = fileAttachment.mimeType,
                    bucket = bucket
                )

                val thumbUrl = variantUrls["thumb"] ?: fileAttachment.url
                val medUrl = variantUrls["medium"] ?: fileAttachment.url

                fileAttachmentRepository.updateVariantUrls(
                    id = fileAttachment.id,
                    thumbUrl = thumbUrl,
                    medUrl = medUrl,
                    width = fileAttachment.width ?: image.width,
                    height = fileAttachment.height ?: image.height
                )
                if (variantUrls.isEmpty()) skipped++ else processed++
            } catch (e: Exception) {
                log.warn("Backfill failed for FileAttachment id={}: {}", fileAttachment.id, e.message)
                // 실패해도 원본 URL로 채워서 무한 반복 방지
                try {
                    fileAttachmentRepository.updateVariantUrls(
                        id = fileAttachment.id, thumbUrl = fileAttachment.url, medUrl = fileAttachment.url,
                        width = fileAttachment.width ?: 0, height = fileAttachment.height ?: 0
                    )
                } catch (_: Exception) { }
                failed++
            }
        }

        return BackfillResult(
            total = total,
            processed = processed,
            skipped = skipped,
            failed = failed,
            durationMs = System.currentTimeMillis() - startMs
        )
    }

    /**
     * Generate a time-limited presigned URL for a file in the private bucket.
     *
     * @param fileKey          the key returned by storeFile() for a private-bucket upload
     * @param expirationMinutes how long the URL remains valid (default 60 minutes)
     * @return presigned HTTPS URL
     */
    /**
     * Get the raw file content from the private bucket as an S3Object.
     */
    fun getPrivateFileObject(fileKey: String): com.amazonaws.services.s3.model.S3Object {
        return amazonS3.getObject(privateBucketName, fileKey)
    }

    fun getPresignedUrl(fileKey: String, expirationMinutes: Long = 60): String {
        val expiration = Date(System.currentTimeMillis() + expirationMinutes * 60 * 1000)
        val request = GeneratePresignedUrlRequest(privateBucketName, fileKey)
            .withMethod(HttpMethod.GET)
            .withExpiration(expiration)
        val presignedUrl = amazonS3.generatePresignedUrl(request).toString()

        // Replace internal S3 endpoint with public endpoint so browsers/devices can access
        fun hostWithOptionalPort(urlStr: String): String {
            val uri = java.net.URI(urlStr)
            return if (uri.port > 0) "${uri.scheme}://${uri.host}:${uri.port}" else "${uri.scheme}://${uri.host}"
        }
        val internalHost = try { hostWithOptionalPort(s3Endpoint) } catch (_: Exception) { s3Endpoint }
        val publicHost = try { hostWithOptionalPort(publicEndpoint) } catch (_: Exception) { publicEndpoint }
        return presignedUrl.replace(internalHost, publicHost)
    }
}
