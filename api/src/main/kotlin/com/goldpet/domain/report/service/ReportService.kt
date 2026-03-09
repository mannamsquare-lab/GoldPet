package com.goldpet.domain.report.service

import com.goldpet.domain.admin.service.AdminCommunityService
import com.goldpet.domain.common.service.SystemSettingService
import com.goldpet.domain.community.repository.CommunityCommentRepository
import com.goldpet.domain.community.repository.CommunityPostRepository
import com.goldpet.domain.course.repository.WalkCourseRepository
import com.goldpet.domain.report.dto.CreateReportRequest
import com.goldpet.domain.report.dto.ReportResponse
import com.goldpet.domain.report.entity.Report
import com.goldpet.domain.report.entity.ReportActionType
import com.goldpet.domain.report.entity.ReportStatus
import com.goldpet.domain.report.entity.ReportType
import com.goldpet.domain.report.repository.ReportRepository
import com.goldpet.domain.common.exception.*
import com.goldpet.domain.user.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class ReportService(
    private val reportRepository: ReportRepository,
    private val userRepository: UserRepository,
    private val postRepository: CommunityPostRepository,
    private val commentRepository: CommunityCommentRepository,
    private val walkCourseRepository: WalkCourseRepository,
    private val systemSettingService: SystemSettingService,
    private val adminCommunityService: AdminCommunityService
) {
    private val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")

    @Transactional
    fun createReport(reporterId: Long, request: CreateReportRequest): ReportResponse {
        val reporter = userRepository.findById(reporterId).orElseThrow { NotFoundException("User not found") }

        // 중복 신고 방지: 이미 PENDING 상태의 동일 신고가 있으면 거부
        if (reportRepository.existsByReporterIdAndTypeAndTargetIdAndStatus(
                reporterId, request.type, request.targetId, ReportStatus.PENDING)) {
            throw BadRequestException("이미 신고한 대상입니다")
        }

        // Validate target exists
        val targetPreview = when (request.type) {
            ReportType.POST -> {
                val post = postRepository.findById(request.targetId).orElseThrow { NotFoundException("Post not found") }
                post.title.take(50)
            }
            ReportType.COMMENT -> {
                val comment = commentRepository.findById(request.targetId).orElseThrow { NotFoundException("Comment not found") }
                comment.content.take(50)
            }
            ReportType.USER -> {
                val user = userRepository.findById(request.targetId).orElseThrow { NotFoundException("User not found") }
                user.nickname ?: "Unknown User"
            }
            ReportType.CHAT -> "Chat Message #${request.targetId}"
            ReportType.COURSE -> {
                val course = walkCourseRepository.findById(request.targetId)
                    .orElseThrow { NotFoundException("Course not found") }
                course.title.take(50)
            }
        }

        val report = Report(
            type = request.type,
            targetId = request.targetId,
            targetPreview = targetPreview,
            reason = request.reason,
            reporter = reporter
        )
        
        val saved = reportRepository.save(report)
        checkAutoSanction(saved)

        return ReportResponse(
            id = saved.id,
            type = saved.type.name,
            targetId = saved.targetId,
            reason = saved.reason,
            status = saved.status.name,
            createdAt = saved.createdAt.format(formatter)
        )
    }

    private fun checkAutoSanction(report: Report) {
        val threshold = systemSettingService.getInt("REPORT_AUTO_HIDE_THRESHOLD", 5)
        if (threshold <= 0) return  // 0 이하면 자동 제재 비활성화

        val totalCount = reportRepository.countByTypeAndTargetIdAndStatusNot(
            report.type, report.targetId, ReportStatus.DISMISSED
        )
        if (totalCount < threshold) return

        when (report.type) {
            ReportType.POST -> {
                val post = postRepository.findById(report.targetId).orElse(null) ?: return
                if (!post.isHidden) {
                    adminCommunityService.hidePost(report.targetId, "신고 처리")
                    report.status = ReportStatus.RESOLVED
                    report.resolvedAt = LocalDateTime.now()
                    report.actionType = ReportActionType.HIDE_POST
                    report.adminNote = "자동 제재: 신고 ${totalCount}건 누적 (임계값: ${threshold})"
                    reportRepository.save(report)
                }
            }
            ReportType.COMMENT -> {
                val comment = commentRepository.findById(report.targetId).orElse(null) ?: return
                if (!comment.isHidden) {
                    adminCommunityService.hideComment(report.targetId, "신고 처리")
                    report.status = ReportStatus.RESOLVED
                    report.resolvedAt = LocalDateTime.now()
                    report.actionType = ReportActionType.HIDE_COMMENT
                    report.adminNote = "자동 제재: 신고 ${totalCount}건 누적 (임계값: ${threshold})"
                    reportRepository.save(report)
                }
            }
            ReportType.COURSE -> {
                val course = walkCourseRepository.findById(report.targetId).orElse(null) ?: return
                if (course.isPublished) {
                    course.isPublished = false
                    walkCourseRepository.save(course)
                    report.status = ReportStatus.RESOLVED
                    report.resolvedAt = LocalDateTime.now()
                    report.actionType = ReportActionType.HIDE_COURSE
                    report.adminNote = "자동 제재: 신고 ${totalCount}건 누적 (임계값: ${threshold})"
                    reportRepository.save(report)
                }
            }
            else -> { /* USER, CHAT: 자동 숨김 대상 아님 */ }
        }
    }

    fun getMyReports(userId: Long): List<ReportResponse> {
        return reportRepository.findAllByReporterId(userId).map { report ->
            ReportResponse(
                id = report.id,
                type = report.type.name,
                targetId = report.targetId,
                reason = report.reason,
                status = report.status.name,
                createdAt = report.createdAt.format(formatter)
            )
        }
    }
}
