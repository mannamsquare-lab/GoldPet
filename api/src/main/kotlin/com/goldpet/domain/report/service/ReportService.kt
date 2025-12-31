package com.goldpet.domain.report.service

import com.goldpet.domain.community.repository.CommunityCommentRepository
import com.goldpet.domain.community.repository.CommunityPostRepository
import com.goldpet.domain.report.dto.CreateReportRequest
import com.goldpet.domain.report.dto.ReportResponse
import com.goldpet.domain.report.entity.Report
import com.goldpet.domain.report.entity.ReportType
import com.goldpet.domain.report.repository.ReportRepository
import com.goldpet.domain.user.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.format.DateTimeFormatter

@Service
class ReportService(
    private val reportRepository: ReportRepository,
    private val userRepository: UserRepository,
    private val postRepository: CommunityPostRepository,
    private val commentRepository: CommunityCommentRepository
) {
    private val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")

    @Transactional
    fun createReport(reporterId: Long, request: CreateReportRequest): ReportResponse {
        val reporter = userRepository.findById(reporterId).orElseThrow { IllegalArgumentException("User not found") }
        
        // Validate target exists
        val targetPreview = when (request.type) {
            ReportType.POST -> {
                val post = postRepository.findById(request.targetId).orElseThrow { IllegalArgumentException("Post not found") }
                post.title.take(50)
            }
            ReportType.COMMENT -> {
                val comment = commentRepository.findById(request.targetId).orElseThrow { IllegalArgumentException("Comment not found") }
                comment.content.take(50)
            }
            ReportType.USER -> {
                val user = userRepository.findById(request.targetId).orElseThrow { IllegalArgumentException("User not found") }
                user.nickname ?: "Unknown User"
            }
            ReportType.CHAT -> "Chat Message #${request.targetId}"
        }

        val report = Report(
            type = request.type,
            targetId = request.targetId,
            targetPreview = targetPreview,
            reason = request.reason,
            reporter = reporter
        )
        
        val saved = reportRepository.save(report)
        
        return ReportResponse(
            id = saved.id,
            type = saved.type.name,
            targetId = saved.targetId,
            reason = saved.reason,
            status = saved.status.name,
            createdAt = saved.createdAt?.format(formatter)
        )
    }

    fun getMyReports(userId: Long): List<ReportResponse> {
        return reportRepository.findAllByReporterId(userId).map { report ->
            ReportResponse(
                id = report.id,
                type = report.type.name,
                targetId = report.targetId,
                reason = report.reason,
                status = report.status.name,
                createdAt = report.createdAt?.format(formatter)
            )
        }
    }
}
