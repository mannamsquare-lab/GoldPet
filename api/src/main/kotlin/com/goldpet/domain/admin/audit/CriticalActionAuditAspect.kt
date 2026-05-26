package com.goldpet.domain.admin.audit

import com.goldpet.config.security.AdminUserPrincipal
import com.goldpet.domain.admin.service.AdminAuditService
import jakarta.servlet.http.HttpServletRequest
import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.context.request.RequestContextHolder
import org.springframework.web.context.request.ServletRequestAttributes

/**
 * [CriticalAction] 어노테이션이 부착된 컨트롤러 메서드를 wrap 하여 audit lane 을 보장한다.
 *
 * 책임:
 * 1. 메서드 실행 전후로 audit 적재.
 * 2. 메서드가 예외를 던져도 실패 audit 을 남기고 원본 예외를 그대로 전파.
 * 3. **audit 적재 자체가 실패하면 [IllegalStateException] 으로 escalate** → controller advice 가 5xx 응답.
 *    (기존 [com.goldpet.config.security.AdminAuditInterceptor] 는 afterCompletion 에서 silent fail.)
 *
 * 본 인프라는 어노테이션 부착 endpoint 만 처리. 미부착 endpoint 는 기존 interceptor 가 200 응답 후 적재.
 */
@Aspect
@Component
class CriticalActionAuditAspect(
    private val adminAuditService: AdminAuditService
) {

    private val log = LoggerFactory.getLogger(javaClass)

    @Around("@annotation(criticalAction)")
    fun around(pjp: ProceedingJoinPoint, criticalAction: CriticalAction): Any? {
        val request = currentRequest()
        val adminUserId = currentAdminUserId()

        try {
            val result = pjp.proceed()
            persistOrThrow(adminUserId, criticalAction.action, request, responseStatus = 200, success = true)
            return result
        } catch (e: Throwable) {
            persistOrThrow(adminUserId, criticalAction.action, request, responseStatus = 500, success = false, failureReason = e.message ?: "UNKNOWN")
            throw e
        }
    }

    private fun persistOrThrow(
        adminUserId: Long?,
        action: String,
        request: HttpServletRequest?,
        responseStatus: Int,
        success: Boolean,
        failureReason: String? = null
    ) {
        if (adminUserId == null) {
            log.error("CriticalAction reached without authenticated admin principal: action={}", action)
            throw IllegalStateException("CriticalAction $action requires authenticated admin principal")
        }
        try {
            val target = request?.requestURI?.let { AuditTargetExtractor.extract(it) }
            val details: AdminAuditDetails? = if (success) null else AdminAuditDetails.Failure(reason = failureReason ?: "UNKNOWN")
            adminAuditService.log(
                adminUserId = adminUserId,
                action = action,
                target = target,
                details = details,
                ipAddress = request?.remoteAddr,
                requestPath = request?.requestURI,
                requestMethod = request?.method,
                responseStatus = responseStatus,
                userAgent = request?.getHeader("User-Agent")
            )
        } catch (e: Exception) {
            log.error("Critical audit logging failed for action={}, adminUserId={}", action, adminUserId, e)
            throw IllegalStateException("Critical audit logging failed for $action", e)
        }
    }

    private fun currentRequest(): HttpServletRequest? {
        val attrs = RequestContextHolder.getRequestAttributes() as? ServletRequestAttributes
        return attrs?.request
    }

    private fun currentAdminUserId(): Long? {
        val auth = SecurityContextHolder.getContext().authentication ?: return null
        val principal = auth.principal
        if (principal is AdminUserPrincipal) return principal.id
        return null
    }
}
