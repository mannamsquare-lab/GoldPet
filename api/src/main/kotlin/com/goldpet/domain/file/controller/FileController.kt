package com.goldpet.domain.file.controller

import com.goldpet.config.security.UserPrincipal
import com.goldpet.domain.file.service.FileService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.net.URI

data class FileUploadResponse(
    val id: Long,
    val url: String,
    val fileType: String,
    val mimeType: String,
    val originalFileName: String?
)

data class PresignedUrlResponse(
    val url: String
)

@RestController
@RequestMapping("/api/v1/files")
class FileController(
    private val fileService: FileService
) {

    /**
     * Upload a file. Pass `category` to control bucket routing:
     * - "profile", "pet", "avatar" -> public bucket (returns direct URL)
     * - omitted or any other value -> private bucket (returns file key; use /files/{key}/url to access)
     */
    @PostMapping("/upload")
    fun uploadFile(
        @RequestParam("file") file: MultipartFile,
        @RequestParam("category", required = false) category: String?,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<FileUploadResponse> {
        val fileAttachment = fileService.storeFile(file, principal.id, category)
        val response = FileUploadResponse(
            id = fileAttachment.id,
            url = fileAttachment.url,
            fileType = fileAttachment.fileType,
            mimeType = fileAttachment.mimeType,
            originalFileName = fileAttachment.originalFileName
        )
        return ResponseEntity.created(URI.create(fileAttachment.url)).body(response)
    }

    /**
     * Get a time-limited presigned URL for a private-bucket file.
     * The `fileKey` is the key returned in the `url` field when uploading to the private bucket.
     */
    @GetMapping("/{fileKey}/url")
    fun getPresignedUrl(
        @PathVariable fileKey: String,
        @RequestParam("expirationMinutes", required = false, defaultValue = "60") expirationMinutes: Long,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<PresignedUrlResponse> {
        val url = fileService.getPresignedUrl(fileKey, expirationMinutes)
        return ResponseEntity.ok(PresignedUrlResponse(url = url))
    }
}
