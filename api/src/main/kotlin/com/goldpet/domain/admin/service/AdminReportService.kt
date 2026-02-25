package com.goldpet.domain.admin.service

import com.goldpet.domain.admin.controller.ReportAdminResponse
import com.goldpet.domain.common.exception.*
import com.goldpet.domain.report.entity.ReportStatus
import com.goldpet.domain.report.repository.ReportRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class AdminReportService(
    private val reportRepository: ReportRepository
) {
    private val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")

    fun getReports(status: String?, pageable: Pageable): Page<ReportAdminResponse> {
        val reports = if (status != null) {
            val reportStatus = ReportStatus.valueOf(status)
            reportRepository.findByStatus(reportStatus, pageable)
        } else {
            reportRepository.findAll(pageable)
        }

        return reports.map { report ->
            ReportAdminResponse(
                id = report.id,
                type = report.type.name,
                targetId = report.targetId,
                targetPreview = report.targetPreview,
                reason = report.reason,
                reporterNickname = report.reporter.nickname ?: "",
                reporterId = report.reporter.id,
                status = report.status.name,
                createdAt = report.createdAt.format(formatter),
                resolvedAt = report.resolvedAt?.format(formatter)
            )
        }
    }

    @Transactional
    fun resolveReport(reportId: Long) {
        val report = reportRepository.findById(reportId)
            .orElseThrow { NotFoundException("Report not found: $reportId") }
        report.status = ReportStatus.RESOLVED
        report.resolvedAt = LocalDateTime.now()
        reportRepository.save(report)
    }

    @Transactional
    fun dismissReport(reportId: Long) {
        val report = reportRepository.findById(reportId)
            .orElseThrow { NotFoundException("Report not found: $reportId") }
        report.status = ReportStatus.DISMISSED
        report.resolvedAt = LocalDateTime.now()
        reportRepository.save(report)
    }
}
