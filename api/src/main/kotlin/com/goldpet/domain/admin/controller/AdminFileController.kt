package com.goldpet.domain.admin.controller

import com.goldpet.config.security.AdminUserPrincipal
import com.goldpet.domain.file.service.FileService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
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

@Tag(name = "어드민: 파일 관리", description = "어드민 파일 업로드 및 이미지 변형 백필")
@RestController
@RequestMapping("/api/v1/admin/files")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'OPERATOR', 'VIEWER')")
class AdminFileController(
    private val fileService: FileService
) {
    @Operation(summary = "어드민 파일 업로드")
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'OPERATOR')")
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

    @Operation(summary = "파일 이미지 변형 일괄 생성")
    @PostMapping("/backfill-variants")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'OPERATOR')")
    fun backfillVariants(
        @RequestParam(defaultValue = "100") batchSize: Int,
        @AuthenticationPrincipal principal: AdminUserPrincipal?
    ): ResponseEntity<FileService.BackfillResult> {
        principal ?: return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        val effectiveBatchSize = batchSize.coerceIn(1, 500)
        val result = fileService.backfillVariants(effectiveBatchSize)
        return ResponseEntity.ok(result)
    }

    @Operation(summary = "스코프 지정 백필", description = "scope=ALL|FILE_ATTACHMENTS|FILE_ATTACHMENTS_RETRY|WALK_SPOTS")
    @PostMapping("/backfill")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'OPERATOR')")
    fun backfillScoped(
        @RequestParam scope: FileService.BackfillScope,
        @RequestParam(defaultValue = "200") batchSize: Int,
        @RequestParam(defaultValue = "false") dryRun: Boolean,
        @AuthenticationPrincipal principal: AdminUserPrincipal?
    ): ResponseEntity<FileService.BackfillResult> {
        principal ?: return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        val effectiveBatchSize = batchSize.coerceIn(1, 500)
        val result = fileService.backfillVariants(scope, effectiveBatchSize, dryRun)
        return ResponseEntity.ok(result)
    }

    @Operation(summary = "재처리 백필 중지", description = "image.backfill.retry_enabled = false")
    @PostMapping("/backfill/stop")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'OPERATOR')")
    fun stopBackfillRetry(
        @AuthenticationPrincipal principal: AdminUserPrincipal?
    ): ResponseEntity<Map<String, String>> {
        principal ?: return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        fileService.stopBackfillRetry()
        return ResponseEntity.ok(mapOf("status" to "stopped", "flag" to FileService.RETRY_ENABLED_KEY))
    }
}
