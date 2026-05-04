package com.goldpet.domain.admin.service

import com.goldpet.config.crypto.BlindIndexUtil
import com.goldpet.domain.admin.audit.AdminAuditDetails
import com.goldpet.domain.admin.audit.AuditTarget
import com.goldpet.domain.admin.controller.AdminUserResponse
import com.goldpet.domain.admin.controller.CreateAdminRequest
import com.goldpet.domain.admin.controller.CreateAdminResponse
import com.goldpet.domain.admin.controller.ResetPasswordResponse
import com.goldpet.domain.admin.controller.SystemInfoResponse
import com.goldpet.domain.admin.controller.UpdateAdminRequest
import com.goldpet.domain.admin.entity.AdminUser
import com.goldpet.domain.admin.entity.AdminUserRole
import com.goldpet.domain.admin.repository.AdminUserRepository
import com.goldpet.domain.common.entity.AppNotice
import com.goldpet.domain.common.entity.AppNoticeType
import com.goldpet.domain.common.exception.BadRequestException
import com.goldpet.domain.common.exception.ConflictException
import com.goldpet.domain.common.exception.NotFoundException
import com.goldpet.domain.common.repository.AppNoticeRepository
import com.goldpet.domain.common.service.SystemSettingService
import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.lang.management.ManagementFactory
import java.security.SecureRandom
import java.time.Duration
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class AdminSystemService(
    private val systemSettingService: SystemSettingService,
    private val adminUserRepository: AdminUserRepository,
    private val appNoticeRepository: AppNoticeRepository,
    private val passwordEncoder: PasswordEncoder,
    private val adminAuditService: AdminAuditService
) {
    companion object {
        private val ADMIN_PASSWORD_REGEX = AdminAuthService.ADMIN_PASSWORD_REGEX
    }

    private val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")

    @PersistenceContext
    private lateinit var entityManager: EntityManager

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
        return adminUserRepository.findAll().map { it.toResponse() }
    }

    @Transactional
    fun createAdmin(request: CreateAdminRequest, currentAdminId: Long): CreateAdminResponse {
        val emailHash = BlindIndexUtil.hash(request.email)
            ?: throw BadRequestException("Invalid email")
        if (adminUserRepository.findByEmailHash(emailHash).isPresent) {
            throw ConflictException("이미 존재하는 이메일입니다", "ADMIN_EMAIL_DUPLICATE")
        }

        val tempPassword = request.temporaryPassword?.takeIf { it.isNotBlank() }
            ?: generateTemporaryPassword()

        if (request.temporaryPassword?.isNotBlank() == true && !ADMIN_PASSWORD_REGEX.matches(tempPassword)) {
            throw BadRequestException("비밀번호는 8자 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다.")
        }

        val admin = AdminUser(
            email = request.email,
            emailHash = emailHash,
            passwordHash = passwordEncoder.encode(tempPassword),
            name = request.name,
            role = request.role,
            isActive = true,
            mustChangePassword = true
        )
        val saved = adminUserRepository.save(admin)

        adminAuditService.log(
            adminUserId = currentAdminId,
            action = "ADMIN_CREATE",
            target = AuditTarget("ADMIN_USER", saved.id),
            details = AdminAuditDetails.AdminCreate(role = saved.role, email = saved.email)
        )

        return CreateAdminResponse(
            id = saved.id,
            email = saved.email,
            name = saved.name,
            role = saved.role,
            temporaryPassword = tempPassword
        )
    }

    @Transactional
    fun updateAdmin(id: Long, request: UpdateAdminRequest, currentAdminId: Long): AdminUserResponse {
        val admin = adminUserRepository.findById(id)
            .orElseThrow { NotFoundException("관리자를 찾을 수 없습니다") }

        val isSelf = id == currentAdminId
        val newRole = request.role
        val newActive = request.isActive

        if (isSelf && newRole != null && newRole != admin.role) {
            throw BadRequestException("본인의 권한은 변경할 수 없습니다")
        }
        if (isSelf && newActive == false) {
            throw BadRequestException("본인 계정을 비활성화할 수 없습니다")
        }

        val willDemoteSuperAdmin = admin.role == AdminUserRole.SUPER_ADMIN && admin.isActive &&
            ((newRole != null && newRole != AdminUserRole.SUPER_ADMIN) || newActive == false)

        if (willDemoteSuperAdmin) {
            acquireSuperAdminLock()
            val activeSuperAdmins = countActiveSuperAdminsForUpdate()
            if (activeSuperAdmins <= 1) {
                throw ConflictException("마지막 SUPER_ADMIN 은 변경/비활성화할 수 없습니다", "LAST_SUPER_ADMIN")
            }
        }

        val before = admin.role
        request.name?.let { admin.name = it }
        newRole?.let { admin.role = it }
        newActive?.let { admin.isActive = it }
        val after = admin.role
        adminUserRepository.save(admin)

        adminAuditService.log(
            adminUserId = currentAdminId,
            action = "ADMIN_UPDATE",
            target = AuditTarget("ADMIN_USER", admin.id),
            details = AdminAuditDetails.RoleChange(before = before, after = after)
        )

        return admin.toResponse()
    }

    @Transactional
    fun deleteAdmin(id: Long, currentAdminId: Long) {
        if (id == currentAdminId) {
            throw BadRequestException("본인 계정은 삭제할 수 없습니다")
        }
        val admin = adminUserRepository.findById(id)
            .orElseThrow { NotFoundException("관리자를 찾을 수 없습니다") }

        if (admin.role == AdminUserRole.SUPER_ADMIN && admin.isActive) {
            acquireSuperAdminLock()
            if (countActiveSuperAdminsForUpdate() <= 1) {
                throw ConflictException("마지막 SUPER_ADMIN 은 삭제할 수 없습니다", "LAST_SUPER_ADMIN")
            }
        }

        admin.isActive = false
        adminUserRepository.save(admin)

        adminAuditService.log(
            adminUserId = currentAdminId,
            action = "ADMIN_DELETE",
            target = AuditTarget("ADMIN_USER", admin.id),
            details = AdminAuditDetails.AdminDelete(role = admin.role, isActive = false)
        )
    }

    @Transactional
    fun resetPassword(id: Long, currentAdminId: Long): ResetPasswordResponse {
        val admin = adminUserRepository.findById(id)
            .orElseThrow { NotFoundException("관리자를 찾을 수 없습니다") }

        val tempPassword = generateTemporaryPassword()
        admin.passwordHash = passwordEncoder.encode(tempPassword)
        admin.mustChangePassword = true
        adminUserRepository.save(admin)

        adminAuditService.log(
            adminUserId = currentAdminId,
            action = "ADMIN_PASSWORD_RESET",
            target = AuditTarget("ADMIN_USER", admin.id),
            details = AdminAuditDetails.PasswordReset(target = admin.id.toString())
        )

        return ResetPasswordResponse(temporaryPassword = tempPassword)
    }

    private fun acquireSuperAdminLock() {
        // advisory_lock_registry: 1001 = admin SUPER_ADMIN 마지막 보호 race lock
        entityManager.createNativeQuery("SELECT pg_advisory_xact_lock(1001)").singleResult
    }

    private fun countActiveSuperAdminsForUpdate(): Long {
        val rows = entityManager.createNativeQuery(
            "SELECT 1 FROM admin_users WHERE role = 'SUPER_ADMIN' AND is_active = true FOR UPDATE"
        ).resultList
        return rows.size.toLong()
    }

    private fun generateTemporaryPassword(): String {
        val upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"
        val lower = "abcdefghijkmnpqrstuvwxyz"
        val digit = "23456789"
        val special = "!@#$%^&*()-_=+"
        val all = upper + lower + digit + special
        val rng = SecureRandom()
        val chars = mutableListOf(
            upper[rng.nextInt(upper.length)],
            lower[rng.nextInt(lower.length)],
            digit[rng.nextInt(digit.length)],
            special[rng.nextInt(special.length)]
        )
        repeat(12) { chars += all[rng.nextInt(all.length)] }
        chars.shuffle(rng)
        return chars.joinToString("")
    }

    private fun AdminUser.toResponse(): AdminUserResponse = AdminUserResponse(
        id = id,
        email = email,
        name = name,
        role = role.name,
        lastLogin = lastLoginAt?.format(formatter),
        isActive = isActive,
        mustChangePassword = mustChangePassword
    )

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
