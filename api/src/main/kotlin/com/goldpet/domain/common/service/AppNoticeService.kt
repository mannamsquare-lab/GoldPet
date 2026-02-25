package com.goldpet.domain.common.service

import com.goldpet.domain.common.dto.AppNoticeResponse
import com.goldpet.domain.common.dto.CreateAppNoticeRequest
import com.goldpet.domain.common.dto.UpdateAppNoticeRequest
import com.goldpet.domain.common.entity.AppNotice
import com.goldpet.domain.common.entity.AppNoticeType
import com.goldpet.domain.common.exception.*
import com.goldpet.domain.common.repository.AppNoticeRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional(readOnly = true)
class AppNoticeService(
    private val appNoticeRepository: AppNoticeRepository
) {

    fun getActiveNotices(screen: String?): List<AppNoticeResponse> {
        val now = LocalDateTime.now()
        val targetScreen = screen ?: "ALL"
        return appNoticeRepository.findActiveNotices(now, targetScreen)
            .map { it.toResponse() }
    }

    fun getMaintenanceNotice(): AppNoticeResponse? {
        val now = LocalDateTime.now()
        return appNoticeRepository.findActiveByType(AppNoticeType.MAINTENANCE, now)
            .firstOrNull()
            ?.toResponse()
    }

    fun getAllNotices(): List<AppNoticeResponse> {
        return appNoticeRepository.findAll()
            .sortedByDescending { it.priority }
            .map { it.toResponse() }
    }

    @Transactional
    fun createNotice(request: CreateAppNoticeRequest): AppNoticeResponse {
        val notice = AppNotice(
            type = request.type,
            title = request.title,
            content = request.content,
            imageUrl = request.imageUrl,
            linkUrl = request.linkUrl,
            targetScreen = request.targetScreen ?: "ALL",
            priority = request.priority,
            isDismissible = request.isDismissible,
            startAt = request.startAt,
            endAt = request.endAt
        )
        return appNoticeRepository.save(notice).toResponse()
    }

    @Transactional
    fun updateNotice(id: Long, request: UpdateAppNoticeRequest): AppNoticeResponse {
        val notice = appNoticeRepository.findById(id)
            .orElseThrow { NotFoundException("공지사항을 찾을 수 없습니다: $id") }

        request.type?.let { notice.type = it }
        request.title?.let { notice.title = it }
        request.content?.let { notice.content = it }
        request.imageUrl?.let { notice.imageUrl = it }
        request.linkUrl?.let { notice.linkUrl = it }
        request.targetScreen?.let { notice.targetScreen = it }
        request.priority?.let { notice.priority = it }
        request.isDismissible?.let { notice.isDismissible = it }
        request.isActive?.let { notice.isActive = it }
        request.startAt?.let { notice.startAt = it }
        request.endAt?.let { notice.endAt = it }

        return appNoticeRepository.save(notice).toResponse()
    }

    @Transactional
    fun deleteNotice(id: Long) {
        val notice = appNoticeRepository.findById(id)
            .orElseThrow { NotFoundException("공지사항을 찾을 수 없습니다: $id") }
        notice.isActive = false
        appNoticeRepository.save(notice)
    }

    private fun AppNotice.toResponse() = AppNoticeResponse(
        id = id,
        type = type,
        title = title,
        content = content,
        imageUrl = imageUrl,
        linkUrl = linkUrl,
        targetScreen = targetScreen,
        priority = priority,
        isDismissible = isDismissible,
        startAt = startAt,
        endAt = endAt,
        isActive = isActive
    )
}
