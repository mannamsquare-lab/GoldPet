package com.goldpet.domain.admin.controller

import com.goldpet.domain.admin.entity.AdminAuditLog
import com.goldpet.domain.admin.service.AdminAuditService
import com.goldpet.domain.admin.service.AdminSystemService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@Tag(name = "Admin System Management", description = "관리자 시스템 관리 API")
@RestController
@RequestMapping("/api/v1/admin/system")
class AdminSystemController(
    private val adminSystemService: AdminSystemService,
    private val adminAuditService: AdminAuditService,
    private val piiEncryptionMigrationService: com.goldpet.domain.admin.service.PiiEncryptionMigrationService
) {
    @Operation(summary = "시스템 정보 조회")
    @GetMapping("/info")
    fun getSystemInfo(): ResponseEntity<SystemInfoResponse> {
        return ResponseEntity.ok(adminSystemService.getSystemInfo())
    }

    @Operation(summary = "관리자 목록 조회")
    @GetMapping("/admins")
    fun getAdmins(): ResponseEntity<List<AdminUserResponse>> {
        return ResponseEntity.ok(adminSystemService.getAdmins())
    }

    @Operation(summary = "점검 모드 설정")
    @PostMapping("/maintenance")
    fun setMaintenanceMode(@RequestBody request: MaintenanceModeRequest): ResponseEntity<Void> {
        adminSystemService.setMaintenanceMode(request.enabled)
        return ResponseEntity.ok().build()
    }
    @Operation(summary = "시스템 설정 조회")
    @GetMapping("/configs")
    fun getConfigs(): ResponseEntity<List<AppConfigResponse>> {
        return ResponseEntity.ok(adminSystemService.getAllConfigs())
    }

    @Operation(summary = "시스템 설정 수정")
    @PostMapping("/configs")
    fun updateConfig(@RequestBody request: UpdateConfigRequest): ResponseEntity<Void> {
        adminSystemService.updateConfig(request.key, request.value)
        return ResponseEntity.ok().build()
    }

    @Operation(summary = "기존 PII 데이터 암호화 마이그레이션 (일회성)")
    @PostMapping("/migrate-pii-encryption")
    fun migratePiiEncryption(): ResponseEntity<com.goldpet.domain.admin.service.PiiEncryptionMigrationService.MigrationResult> {
        val result = piiEncryptionMigrationService.migrateExistingPiiData()
        return ResponseEntity.ok(result)
    }

    @Operation(summary = "관리자 감사 로그 조회")
    @GetMapping("/audit-logs")
    fun getAuditLogs(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int
    ): Page<AdminAuditLog> {
        return adminAuditService.getAuditLogs(Pageable.ofSize(size).withPage(page))
    }
}

data class AppConfigResponse(
    val key: String,
    val value: String,
    val description: String?
)

data class UpdateConfigRequest(
    val key: String,
    val value: String
)

data class SystemInfoResponse(
    val version: String,
    val environment: String,
    val serverTime: String,
    val uptime: String,
    val dbStatus: String,
    val cacheStatus: String,
    val storageUsed: Double,
    val storageTotal: Double
)

data class AdminUserResponse(
    val id: Long,
    val email: String,
    val name: String,
    val role: String,
    val lastLogin: String?
)

data class MaintenanceModeRequest(
    val enabled: Boolean
)
