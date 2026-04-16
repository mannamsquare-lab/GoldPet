package com.goldpet.domain.admin.controller

import com.goldpet.config.security.AdminUserPrincipal
import com.goldpet.domain.file.service.FileService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.net.URI

data class AdminFileUploadResponse(
    val id: Long,
    val url: String,
    val thumbnailUrl: String?,
    val mediumUrl: String?,
    val originalFileName: String?
)

@RestController
@RequestMapping("/api/v1/admin/files")
class AdminFileController(
    private val fileService: FileService
) {
    @PostMapping("/upload")
    fun uploadFile(
        @RequestParam("file") file: MultipartFile,
        @RequestParam("category", required = false, defaultValue = "notice") category: String,
        @AuthenticationPrincipal principal: AdminUserPrincipal
    ): ResponseEntity<AdminFileUploadResponse> {
        val fileAttachment = fileService.storeFile(file, principal.id, category)
        val response = AdminFileUploadResponse(
            id = fileAttachment.id,
            url = fileAttachment.url,
            thumbnailUrl = fileAttachment.thumbnailUrl,
            mediumUrl = fileAttachment.mediumUrl,
            originalFileName = fileAttachment.originalFileName
        )
        return ResponseEntity.created(URI.create(fileAttachment.url)).body(response)
    }

    @PostMapping("/backfill-variants")
    fun backfillVariants(
        @RequestParam(defaultValue = "100") batchSize: Int,
        @AuthenticationPrincipal principal: AdminUserPrincipal?
    ): ResponseEntity<FileService.BackfillResult> {
        principal ?: return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        val effectiveBatchSize = batchSize.coerceIn(1, 500)
        val result = fileService.backfillVariants(effectiveBatchSize)
        return ResponseEntity.ok(result)
    }
}
