package com.goldpet.domain.report.dto

import com.goldpet.domain.report.entity.ReportType

data class CreateReportRequest(
    val type: ReportType,
    val targetId: Long,
    val reason: String
)

data class ReportResponse(
    val id: Long,
    val type: String,
    val targetId: Long,
    val reason: String,
    val status: String,
    val createdAt: String?
)
