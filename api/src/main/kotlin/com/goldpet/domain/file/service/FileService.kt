package com.goldpet.domain.file.service

import com.amazonaws.HttpMethod
import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest
import com.amazonaws.services.s3.model.ObjectMetadata
import com.drew.imaging.ImageMetadataReader
import com.drew.metadata.exif.GpsDirectory
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.awt.image.BufferedImage
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.util.Date
import java.util.UUID
import javax.imageio.ImageIO

private const val MAX_IMAGE_SIZE = 10 * 1024 * 1024L // 10MB
private val ALLOWED_IMAGE_TYPES = setOf("image/jpeg", "image/png", "image/gif", "image/webp")

enum class StorageBucket {
    PUBLIC,  // Profile images, pet images - directly accessible via public URL
    PRIVATE  // Chat images, community posts - requires presigned URL
}

@Service
class FileService(
    private val amazonS3: AmazonS3,
    @Value("\${S3_PUBLIC_BUCKET_NAME:goldpet-public}") private val publicBucketName: String,
    @Value("\${S3_PRIVATE_BUCKET_NAME:goldpet-private}") private val privateBucketName: String,
    @Value("\${S3_PUBLIC_ENDPOINT:http://localhost:9100}") private val publicEndpoint: String,
    private val fileAttachmentRepository: com.goldpet.domain.common.repository.FileAttachmentRepository
) {
    private val log = LoggerFactory.getLogger(javaClass)

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
            "profile", "pet", "avatar" -> StorageBucket.PUBLIC
            else -> StorageBucket.PRIVATE
        }
    }

    private fun validateImageFile(file: MultipartFile) {
        if (file.size > MAX_IMAGE_SIZE) {
            throw IllegalArgumentException("File size exceeds maximum allowed size of 10MB")
        }
        val contentType = file.contentType?.lowercase()
        if (contentType == null || contentType !in ALLOWED_IMAGE_TYPES) {
            throw IllegalArgumentException("Unsupported file type: $contentType. Allowed types: ${ALLOWED_IMAGE_TYPES.joinToString()}")
        }
    }

    private fun stripExifGpsData(fileBytes: ByteArray, contentType: String): ByteArray {
        if (contentType != "image/jpeg") return fileBytes
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
            val processedBytes = stripExifGpsData(file.bytes, mimeType)

            val metadata = ObjectMetadata().apply {
                contentType = mimeType
                contentLength = processedBytes.size.toLong()
            }

            val bucket = determineBucket(category)
            val targetBucket = if (bucket == StorageBucket.PUBLIC) publicBucketName else privateBucketName

            amazonS3.putObject(targetBucket, newFilename, ByteArrayInputStream(processedBytes), metadata)

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
                sizeBytes = file.size
            )
            return fileAttachmentRepository.save(fileAttachment)
        } catch (e: IllegalArgumentException) {
            throw e
        } catch (e: IOException) {
            throw RuntimeException("Failed to store file.", e)
        } catch (e: Exception) {
            throw RuntimeException("Failed to upload to S3.", e)
        }
    }

    /**
     * Generate a time-limited presigned URL for a file in the private bucket.
     *
     * @param fileKey          the key returned by storeFile() for a private-bucket upload
     * @param expirationMinutes how long the URL remains valid (default 60 minutes)
     * @return presigned HTTPS URL
     */
    fun getPresignedUrl(fileKey: String, expirationMinutes: Long = 60): String {
        val expiration = Date(System.currentTimeMillis() + expirationMinutes * 60 * 1000)
        val request = GeneratePresignedUrlRequest(privateBucketName, fileKey)
            .withMethod(HttpMethod.GET)
            .withExpiration(expiration)
        return amazonS3.generatePresignedUrl(request).toString()
    }
}
