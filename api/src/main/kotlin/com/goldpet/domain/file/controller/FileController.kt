package com.goldpet.domain.file.controller

import com.goldpet.config.security.UserPrincipal
import com.goldpet.domain.file.service.FileService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
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
    val mimeType: String
)

@RestController
@RequestMapping("/api/v1/files")
class FileController(
    private val fileService: FileService
) {

    @PostMapping("/upload")
    fun uploadFile(
        @RequestParam("file") file: MultipartFile,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<FileUploadResponse> {
        val fileAttachment = fileService.storeFile(file, principal.id)
        val response = FileUploadResponse(
            id = fileAttachment.id,
            url = fileAttachment.url,
            fileType = fileAttachment.fileType,
            mimeType = fileAttachment.mimeType
        )
        return ResponseEntity.created(URI.create(fileAttachment.url)).body(response)
    }
}
