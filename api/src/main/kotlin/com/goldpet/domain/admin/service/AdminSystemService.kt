package com.goldpet.domain.admin.service

import com.goldpet.domain.admin.controller.AdminUserResponse
import com.goldpet.domain.admin.controller.SystemInfoResponse
import org.springframework.stereotype.Service
import java.lang.management.ManagementFactory
import java.time.Duration
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class AdminSystemService(
    private val systemSettingService: com.goldpet.domain.common.service.SystemSettingService
) {
    private var maintenanceMode = false
    private val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")

    fun getSystemInfo(): SystemInfoResponse {
        val runtime = ManagementFactory.getRuntimeMXBean()
        val uptime = Duration.ofMillis(runtime.uptime)
        val uptimeStr = "${uptime.toDays()}일 ${uptime.toHoursPart()}시간 ${uptime.toMinutesPart()}분"

        return SystemInfoResponse(
            version = "2.1.0",
            environment = System.getProperty("spring.profiles.active", "development"),
            serverTime = LocalDateTime.now().format(formatter),
            uptime = uptimeStr,
            dbStatus = "OK",
            cacheStatus = "OK",
            storageUsed = 45.2,
            storageTotal = 100.0
        )
    }

    fun getAdmins(): List<AdminUserResponse> {
        // Mock data - would come from admin_users table
        return listOf(
            AdminUserResponse(1, "admin@goldpet.com", "최고관리자", "SUPER_ADMIN", "2025-12-21 14:30"),
            AdminUserResponse(2, "operator@goldpet.com", "운영자", "OPERATOR", "2025-12-21 10:00")
        )
    }

    fun setMaintenanceMode(enabled: Boolean) {
        maintenanceMode = enabled
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
