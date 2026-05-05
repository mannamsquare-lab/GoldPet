package com.goldpet.domain.admin.controller

import com.goldpet.config.security.AdminUserPrincipal
import com.goldpet.domain.admin.audit.AdminAuditDetails
import com.goldpet.domain.admin.audit.AuditTarget
import com.goldpet.domain.admin.audit.CriticalAction
import com.goldpet.domain.admin.dto.BackupJobResponse
import com.goldpet.domain.admin.entity.AdminAuditLog
import com.goldpet.domain.admin.entity.AdminUserRole
import com.goldpet.domain.admin.service.AdminAuditService
import com.goldpet.domain.admin.service.AdminSystemService
import com.goldpet.domain.admin.service.BackupJobService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@Tag(name = "Admin System Management", description = "관리자 시스템 관리 API")
@RestController
@RequestMapping("/api/v1/admin/system")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'OPERATOR', 'VIEWER')")
class AdminSystemController(
    private val adminSystemService: AdminSystemService,
    private val adminAuditService: AdminAuditService,
    private val backupJobService: BackupJobService,
    private val piiEncryptionMigrationService: com.goldpet.domain.admin.service.PiiEncryptionMigrationService
) {
    @Operation(summary = "시스템 정보 조회")
    @GetMapping("/info")
    fun getSystemInfo(): ResponseEntity<SystemInfoResponse> {
        return ResponseEntity.ok(adminSystemService.getSystemInfo())
    }

    @Operation(summary = "DB 백업 수동 트리거")
    @PostMapping("/backup")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @CriticalAction(action = "BACKUP_TRIGGER")
    fun triggerBackup(
        @AuthenticationPrincipal principal: AdminUserPrincipal
    ): ResponseEntity<BackupJobResponse> {
        val job = backupJobService.trigger(principal.id)
        adminAuditService.log(
            adminUserId = principal.id,
            action = "BACKUP_TRIGGER",
            target = AuditTarget("BACKUP_JOB", job.id),
            details = AdminAuditDetails.Backup(filePath = null, sizeBytes = null)
        )
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(job)
    }

    @Operation(summary = "백업 작업 목록 조회")
    @GetMapping("/backup/jobs")
    fun getBackupJobs(
        @RequestParam(defaultValue = "20") limit: Int
    ): ResponseEntity<List<BackupJobResponse>> {
        return ResponseEntity.ok(backupJobService.listJobs(limit))
    }

    @Operation(summary = "관리자 목록 조회")
    @GetMapping("/admins")
    fun getAdmins(): ResponseEntity<List<AdminUserResponse>> {
        return ResponseEntity.ok(adminSystemService.getAdmins())
    }

    @Operation(summary = "관리자 추가")
    @PostMapping("/admins")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @CriticalAction(action = "ADMIN_CREATE")
    fun createAdmin(
        @AuthenticationPrincipal principal: AdminUserPrincipal,
        @RequestBody request: CreateAdminRequest
    ): ResponseEntity<CreateAdminResponse> {
        val response = adminSystemService.createAdmin(request, principal.id)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @Operation(summary = "관리자 수정")
    @PutMapping("/admins/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @CriticalAction(action = "ADMIN_UPDATE")
    fun updateAdmin(
        @AuthenticationPrincipal principal: AdminUserPrincipal,
        @PathVariable id: Long,
        @RequestBody request: UpdateAdminRequest
    ): ResponseEntity<AdminUserResponse> {
        return ResponseEntity.ok(adminSystemService.updateAdmin(id, request, principal.id))
    }

    @Operation(summary = "관리자 삭제")
    @DeleteMapping("/admins/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @CriticalAction(action = "ADMIN_DELETE")
    fun deleteAdmin(
        @AuthenticationPrincipal principal: AdminUserPrincipal,
        @PathVariable id: Long
    ): ResponseEntity<Void> {
        adminSystemService.deleteAdmin(id, principal.id)
        return ResponseEntity.noContent().build()
    }

    @Operation(summary = "관리자 임시비밀번호 재발급")
    @PostMapping("/admins/{id}/reset-password")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @CriticalAction(action = "ADMIN_PASSWORD_RESET")
    fun resetPassword(
        @AuthenticationPrincipal principal: AdminUserPrincipal,
        @PathVariable id: Long
    ): ResponseEntity<ResetPasswordResponse> {
        return ResponseEntity.ok(adminSystemService.resetPassword(id, principal.id))
    }

    @Operation(summary = "점검 모드 상태 조회")
    @GetMapping("/maintenance")
    fun getMaintenanceStatus(): ResponseEntity<MaintenanceStatusResponse> {
        return ResponseEntity.ok(MaintenanceStatusResponse(adminSystemService.isMaintenanceMode()))
    }

    @Operation(summary = "점검 모드 설정")
    @PostMapping("/maintenance")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
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
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @CriticalAction(action = "SYSTEM_CONFIG_UPDATE")
    fun updateConfig(@RequestBody request: UpdateConfigRequest): ResponseEntity<Void> {
        adminSystemService.updateConfig(request.key, request.value)
        return ResponseEntity.ok().build()
    }

    @Operation(summary = "기존 PII 데이터 암호화 마이그레이션 (일회성)")
    @PostMapping("/migrate-pii-encryption")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    fun migratePiiEncryption(): ResponseEntity<com.goldpet.domain.admin.service.PiiEncryptionMigrationService.MigrationResult> {
        val result = piiEncryptionMigrationService.migrateExistingPiiData()
        return ResponseEntity.ok(result)
    }

    @Operation(summary = "관리자 감사 로그 조회")
    @GetMapping("/audit-logs")
    @CriticalAction(action = "AUDIT_LOG_VIEW")
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
    val lastLogin: String?,
    val isActive: Boolean = true,
    val mustChangePassword: Boolean = false
)

data class MaintenanceModeRequest(
    val enabled: Boolean
)

data class MaintenanceStatusResponse(
    val enabled: Boolean
)

data class CreateAdminRequest(
    val email: String,
    val name: String,
    val role: AdminUserRole,
    val temporaryPassword: String? = null
)

data class CreateAdminResponse(
    val id: Long,
    val email: String,
    val name: String,
    val role: AdminUserRole,
    // 1회만 노출되는 평문 임시비밀번호 — 응답 외 어디에도 저장 금지.
    val temporaryPassword: String
)

data class UpdateAdminRequest(
    val name: String? = null,
    val role: AdminUserRole? = null,
    val isActive: Boolean? = null
)

data class ResetPasswordResponse(
    val temporaryPassword: String
)
