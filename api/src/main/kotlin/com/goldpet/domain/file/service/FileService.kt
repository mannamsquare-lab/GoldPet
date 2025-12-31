package com.goldpet.domain.file.service

import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.ObjectMetadata
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.io.IOException
import java.util.UUID

@Service
class FileService(
    private val amazonS3: AmazonS3,
    @Value("\${S3_BUCKET_NAME:goldpet-files}") private val bucketName: String,
    @Value("\${S3_PUBLIC_ENDPOINT:http://localhost:9000}") private val publicEndpoint: String,
    private val fileAttachmentRepository: com.goldpet.domain.common.repository.FileAttachmentRepository
) {

    init {
        try {
            if (!amazonS3.doesBucketExistV2(bucketName)) {
                amazonS3.createBucket(bucketName)
            }
            
            // Ensure public read policy
            val policy = """
            {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Sid": "PublicReadGetObject",
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": "s3:GetObject",
                        "Resource": "arn:aws:s3:::$bucketName/*"
                    }
                ]
            }
            """.trimIndent()
            amazonS3.setBucketPolicy(bucketName, policy)

        } catch (e: Exception) {
            // Log error or handle gracefully if connection fails on startup
            println("Warning: S3/MinIO connection failed: ${e.message}")
        }
    }

    @org.springframework.transaction.annotation.Transactional
    fun storeFile(file: MultipartFile, userId: Long): String {
        try {
            if (file.isEmpty) {
                throw RuntimeException("Failed to store empty file.")
            }
            val originalFilename = file.originalFilename ?: "unknown"
            val extension = originalFilename.substringAfterLast(".", "")
            val newFilename = "${UUID.randomUUID()}.$extension"
            
            val metadata = ObjectMetadata().apply {
                contentType = file.contentType ?: "application/octet-stream"
                contentLength = file.size
            }

            amazonS3.putObject(bucketName, newFilename, file.inputStream, metadata)
            
            // Construct URL accessible by public/frontend
            // If using MinIO locally, this is http://localhost:9000/bucket/filename
            val fileUrl = "$publicEndpoint/$bucketName/$newFilename"
            
            val fileAttachment = com.goldpet.domain.common.entity.FileAttachment(
                ownerUserId = userId,
                fileType = "IMAGE",
                mimeType = metadata.contentType,
                url = fileUrl,
                sizeBytes = file.size
            )
            fileAttachmentRepository.save(fileAttachment)

            return fileUrl
        } catch (e: IOException) {
            throw RuntimeException("Failed to store file.", e)
        } catch (e: Exception) {
             throw RuntimeException("Failed to upload to S3.", e)
        }
    }
}
