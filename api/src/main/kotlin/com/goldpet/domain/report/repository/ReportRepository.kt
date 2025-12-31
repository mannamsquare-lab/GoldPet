package com.goldpet.domain.report.repository

import com.goldpet.domain.report.entity.Report
import com.goldpet.domain.report.entity.ReportStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository

interface ReportRepository : JpaRepository<Report, Long> {
    fun findByStatus(status: ReportStatus, pageable: Pageable): Page<Report>
    fun countByStatus(status: ReportStatus): Long
    fun findAllByReporterId(reporterId: Long): List<Report>
}
