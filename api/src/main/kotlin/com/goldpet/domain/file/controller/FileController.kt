package com.goldpet.domain.file.controller

import com.goldpet.config.security.UserPrincipal
import com.goldpet.domain.file.service.FileService
import io.micrometer.core.instrument.MeterRegistry
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.slf4j.LoggerFactory
import org.springframework.core.io.InputStreamResource
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
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
    val thumbnailUrl: String?,
    val mediumUrl: String?,
    /** T1-5: viewer variant (1600px). async variant-gen 완료 전에는 null. 클라이언트는
     *  업로드 직후 DOM 에 url 사용, 이후 재조회 시 viewerUrl 로 전환 가능. */
    val viewerUrl: String?,
    val fileType: String,
    val mimeType: String,
    val originalFileName: String?,
    val width: Int?,
    val height: Int?
)

data class PresignedUrlResponse(
    val url: String
)

@Tag(name = "파일", description = "파일 업로드 및 다운로드")
@RestController
@RequestMapping("/api/v1/files")
class FileController(
    private val fileService: FileService,
    private val meterRegistry: MeterRegistry
) {
    private val log = LoggerFactory.getLogger(javaClass)

    /**
     * Upload a file. Pass `category` to control bucket routing:
     * - "profile", "pet", "avatar" -> public bucket (returns direct URL)
     * - omitted or any other value -> private bucket (returns file key; use /files/{key}/url to access)
     */
    @Operation(summary = "파일 업로드")
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
            thumbnailUrl = fileAttachment.thumbnailUrl,
            mediumUrl = fileAttachment.mediumUrl,
            viewerUrl = fileAttachment.viewerUrl,
            fileType = fileAttachment.fileType,
            mimeType = fileAttachment.mimeType,
            originalFileName = fileAttachment.originalFileName,
            width = fileAttachment.width,
            height = fileAttachment.height
        )
        return ResponseEntity.created(URI.create(fileAttachment.url)).body(response)
    }

    /**
     * **DEPRECATED (T1-4)** — 비공개 파일 streaming 프록시.
     *
     * 이 엔드포인트는 CDN 캐시 키 분리를 방해하고 API 서버 대역폭을 낭비하므로
     * presigned URL (`GET /{fileKey}/url`) 경로로 이전 중이다. TestFlight 배포 후
     * `file_proxy_stream_total` 이 일정 기간 0 으로 수렴하면 HTTP 410 Gone 으로
     * 전환 예정 (plan REV 4 T2-4). 현재는 관측 Counter + deprecated 마크만 적용.
     */
    @Deprecated(
        message = "presigned URL 사용. 다음 릴리스에서 410 Gone 전환 예정",
        replaceWith = ReplaceWith("getPresignedUrl(fileKey, 60, principal)")
    )
    @Operation(
        summary = "[DEPRECATED] 비공개 파일 스트리밍 다운로드",
        description = "T1-4 로 deprecated. presigned URL (/{fileKey}/url) 사용 권장. 다음 릴리스에서 410 Gone 응답 전환 예정.",
        deprecated = true
    )
    @GetMapping("/{fileKey}/content")
    fun getFileContent(
        @PathVariable fileKey: String,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<InputStreamResource> {
        meterRegistry.counter("file_proxy_stream_total", "user_id", principal.id.toString()).increment()
        log.warn(
            "legacy /files/{}/content proxy hit (user_id={}). Client should use presigned URL.",
            fileKey, principal.id
        )
        val s3Object = fileService.getPrivateFileObject(fileKey)
        val contentType = s3Object.objectMetadata.contentType ?: "application/octet-stream"
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(HttpHeaders.CACHE_CONTROL, "public, max-age=3600")
            .body(InputStreamResource(s3Object.objectContent))
    }

    @Operation(summary = "비공개 파일 Presigned URL 발급")
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
