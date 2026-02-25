package com.goldpet.domain.admin.service

import com.goldpet.domain.admin.controller.AdminUserResponse
import com.goldpet.domain.admin.controller.SystemInfoResponse
import com.goldpet.domain.admin.repository.AdminUserRepository
import com.goldpet.domain.common.entity.AppNotice
import com.goldpet.domain.common.entity.AppNoticeType
import com.goldpet.domain.common.repository.AppNoticeRepository
import com.goldpet.domain.common.service.SystemSettingService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.lang.management.ManagementFactory
import java.time.Duration
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class AdminSystemService(
    private val systemSettingService: SystemSettingService,
    private val adminUserRepository: AdminUserRepository,
    private val appNoticeRepository: AppNoticeRepository
) {
    private val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")

    fun getSystemInfo(): SystemInfoResponse {
        val runtime = ManagementFactory.getRuntimeMXBean()
        val uptime = Duration.ofMillis(runtime.uptime)
        val uptimeStr = "${uptime.toDays()}일 ${uptime.toHoursPart()}시간 ${uptime.toMinutesPart()}분"

        val fileStore = java.nio.file.FileSystems.getDefault().fileStores.first()
        val storageTotal = fileStore.totalSpace / (1024.0 * 1024 * 1024)
        val storageUsed = (fileStore.totalSpace - fileStore.usableSpace) / (1024.0 * 1024 * 1024)

        return SystemInfoResponse(
            version = systemSettingService.getString("app.version", "1.0.0"),
            environment = System.getProperty("spring.profiles.active", "development"),
            serverTime = LocalDateTime.now().format(formatter),
            uptime = uptimeStr,
            dbStatus = "OK",
            cacheStatus = "OK",
            storageUsed = storageUsed,
            storageTotal = storageTotal
        )
    }

    fun getAdmins(): List<AdminUserResponse> {
        return adminUserRepository.findAll().map {
            AdminUserResponse(
                id = it.id,
                email = it.email,
                name = it.name,
                role = it.role.name,
                lastLogin = null // 로그인 로그 테이블 구현 시 추가
            )
        }
    }

    fun isMaintenanceMode(): Boolean {
        val now = LocalDateTime.now()
        return appNoticeRepository.findActiveByType(AppNoticeType.MAINTENANCE, now).isNotEmpty()
    }

    @Transactional
    fun setMaintenanceMode(enabled: Boolean) {
        val now = LocalDateTime.now()
        if (enabled) {
            // 이미 활성 MAINTENANCE 공지가 있으면 추가하지 않음
            val existing = appNoticeRepository.findActiveByType(AppNoticeType.MAINTENANCE, now)
            if (existing.isEmpty()) {
                appNoticeRepository.save(
                    AppNotice(
                        type = AppNoticeType.MAINTENANCE,
                        title = "서버 점검 중",
                        content = "서비스 점검 중입니다. 잠시 후 다시 시도해주세요.",
                        targetScreen = "ALL",
                        priority = 100,
                        isDismissible = false,
                        startAt = now,
                        endAt = now.plusHours(4) // 안전장치: 최대 4시간 후 자동 해제
                    )
                )
            }
        } else {
            // 활성 MAINTENANCE 공지를 모두 비활성화
            val activeNotices = appNoticeRepository.findActiveByType(AppNoticeType.MAINTENANCE, now)
            activeNotices.forEach { it.isActive = false }
            appNoticeRepository.saveAll(activeNotices)
        }
    }

    fun getAllConfigs(): List<com.goldpet.domain.admin.controller.AppConfigResponse> {
        return systemSettingService.getAllSettings().map {
            com.goldpet.domain.admin.controller.AppConfigResponse(
                key = it.key,
                value = it.value,
                description = it.description
            )
        }
    }

    fun updateConfig(key: String, value: String) {
        systemSettingService.setValue(key, value)
    }
}
