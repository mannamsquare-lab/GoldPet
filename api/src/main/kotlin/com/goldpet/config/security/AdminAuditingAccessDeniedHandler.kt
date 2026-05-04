package com.goldpet.config.security

import com.goldpet.domain.admin.service.AdminAuditService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.access.AccessDeniedHandler
import org.springframework.stereotype.Component

@Component
class AdminAuditingAccessDeniedHandler(
    private val adminAuditService: AdminAuditService
) : AccessDeniedHandler {

    private val log = LoggerFactory.getLogger(javaClass)

    override fun handle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        accessDeniedException: AccessDeniedException
    ) {
        val path = request.requestURI
        if (path.startsWith("/api/v1/admin/")) {
            val principal = SecurityContextHolder.getContext().authentication?.principal
            if (principal is AdminUserPrincipal) {
                try {
                    adminAuditService.log(
                        adminUserId = principal.id,
                        action = "ACCESS_DENIED",
                        ipAddress = request.remoteAddr,
                        requestPath = path,
                        requestMethod = request.method,
                        responseStatus = HttpStatus.FORBIDDEN.value()
                    )
                } catch (e: Exception) {
                    log.warn("Failed to audit ACCESS_DENIED: ${e.message}")
                }
            }
        }
        response.status = HttpStatus.FORBIDDEN.value()
        response.contentType = MediaType.APPLICATION_JSON_VALUE
        response.characterEncoding = "UTF-8"
        response.writer.write("""{"error":"ACCESS_DENIED"}""")
    }
}
