package com.goldpet.domain.admin.controller

import com.goldpet.domain.admin.service.AdminReportService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@Tag(name = "Admin Report Management", description = "관리자 신고 관리 API")
@RestController
@RequestMapping("/api/v1/admin/reports")
class AdminReportController(
    private val adminReportService: AdminReportService
) {
    @Operation(summary = "신고 목록 조회")
    @GetMapping
    fun getReports(
        @RequestParam(required = false) status: String?,
        pageable: Pageable
    ): ResponseEntity<Page<ReportAdminResponse>> {
        return ResponseEntity.ok(adminReportService.getReports(status, pageable))
    }

    @Operation(summary = "신고 처리 (조치)")
    @PostMapping("/{reportId}/resolve")
    fun resolveReport(@PathVariable reportId: Long): ResponseEntity<Void> {
        adminReportService.resolveReport(reportId)
        return ResponseEntity.ok().build()
    }

    @Operation(summary = "신고 기각")
    @PostMapping("/{reportId}/dismiss")
    fun dismissReport(@PathVariable reportId: Long): ResponseEntity<Void> {
        adminReportService.dismissReport(reportId)
        return ResponseEntity.ok().build()
    }
}

data class ReportAdminResponse(
    val id: Long,
    val type: String,
    val targetId: Long,
    val targetPreview: String?,
    val reason: String,
    val reporterNickname: String,
    val reporterId: Long,
    val status: String,
    val createdAt: String?,
    val resolvedAt: String?
)
