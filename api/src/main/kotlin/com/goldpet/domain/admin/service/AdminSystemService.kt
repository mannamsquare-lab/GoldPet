package com.goldpet.domain.admin.service

import com.goldpet.domain.admin.controller.AdminUserResponse
import com.goldpet.domain.admin.controller.SystemInfoResponse
import com.goldpet.domain.admin.repository.AdminUserRepository
import com.goldpet.domain.common.service.SystemSettingService
import org.springframework.stereotype.Service
import java.lang.management.ManagementFactory
import java.time.Duration
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class AdminSystemService(
    private val systemSettingService: SystemSettingService,
    private val adminUserRepository: AdminUserRepository
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

    fun setMaintenanceMode(enabled: Boolean) {
        systemSettingService.setValue("maintenance.mode", enabled.toString())
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
