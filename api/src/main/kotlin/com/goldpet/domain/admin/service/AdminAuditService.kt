package com.goldpet.domain.admin.service

import com.goldpet.domain.admin.entity.AdminAuditLog
import com.goldpet.domain.admin.repository.AdminAuditLogRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AdminAuditService(
    private val auditLogRepository: AdminAuditLogRepository
) {
    @Transactional
    fun log(
        adminUserId: Long,
        action: String,
        targetType: String? = null,
        targetId: Long? = null,
        ipAddress: String? = null,
        requestPath: String? = null,
        requestMethod: String? = null,
        responseStatus: Int? = null,
        details: String? = null
    ) {
        auditLogRepository.save(
            AdminAuditLog(
                adminUserId = adminUserId,
                action = action,
                targetType = targetType,
                targetId = targetId,
                ipAddress = ipAddress,
                requestPath = requestPath,
                requestMethod = requestMethod,
                responseStatus = responseStatus,
                details = details
            )
        )
    }

    fun getAuditLogs(pageable: Pageable): Page<AdminAuditLog> {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable)
    }

    fun getAuditLogsByAdmin(adminUserId: Long, pageable: Pageable): Page<AdminAuditLog> {
        return auditLogRepository.findByAdminUserIdOrderByCreatedAtDesc(adminUserId, pageable)
    }
}
