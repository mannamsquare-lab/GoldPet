package com.goldpet.domain.admin.controller

import com.goldpet.domain.file.service.FileService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/admin/files")
class AdminFileController(
    private val fileService: FileService
) {
    @PostMapping("/backfill-variants")
    fun backfillVariants(
        @RequestParam(defaultValue = "100") batchSize: Int
    ): ResponseEntity<FileService.BackfillResult> {
        val effectiveBatchSize = batchSize.coerceIn(1, 500)
        val result = fileService.backfillVariants(effectiveBatchSize)
        return ResponseEntity.ok(result)
    }
}
