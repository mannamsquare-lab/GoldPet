package com.goldpet.domain.common.error

import com.goldpet.domain.auth.exception.AccountStatusException
import com.goldpet.domain.common.exception.*
import jakarta.persistence.EntityNotFoundException
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

@RestControllerAdvice
class GlobalExceptionHandler {

    private val log = LoggerFactory.getLogger(javaClass)

    // --- Domain exceptions (new hierarchy) ---

    @ExceptionHandler(NotFoundException::class)
    fun handleNotFoundException(ex: NotFoundException): ResponseEntity<ErrorResponse> {
        log.warn("Not found: {}", ex.message)
        return buildResponse(HttpStatus.NOT_FOUND, ex.errorCode, ex.message)
    }

    @ExceptionHandler(BadRequestException::class)
    fun handleBadRequestException(ex: BadRequestException): ResponseEntity<ErrorResponse> {
        log.warn("Bad request: {}", ex.message)
        return buildResponse(HttpStatus.BAD_REQUEST, ex.errorCode, ex.message)
    }

    @ExceptionHandler(ForbiddenException::class)
    fun handleForbiddenException(ex: ForbiddenException): ResponseEntity<ErrorResponse> {
        log.warn("Forbidden: {}", ex.message)
        return buildResponse(HttpStatus.FORBIDDEN, ex.errorCode, ex.message)
    }

    @ExceptionHandler(ConflictException::class)
    fun handleConflictException(ex: ConflictException): ResponseEntity<ErrorResponse> {
        log.warn("Conflict: {}", ex.message)
        return buildResponse(HttpStatus.CONFLICT, ex.errorCode, ex.message)
    }

    @ExceptionHandler(UnauthorizedException::class)
    fun handleUnauthorizedException(ex: UnauthorizedException): ResponseEntity<ErrorResponse> {
        log.warn("Unauthorized: {}", ex.message)
        return buildResponse(HttpStatus.UNAUTHORIZED, ex.errorCode, ex.message)
    }

    // --- Legacy / framework exceptions ---

    @ExceptionHandler(EntityNotFoundException::class)
    fun handleEntityNotFoundException(ex: EntityNotFoundException): ResponseEntity<ErrorResponse> {
        log.warn("Entity not found: {}", ex.message)
        return buildResponse(HttpStatus.NOT_FOUND, "NOT_FOUND", ex.message ?: "Resource not found")
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgumentException(ex: IllegalArgumentException): ResponseEntity<ErrorResponse> {
        log.warn("Illegal argument: {}", ex.message)
        return buildResponse(HttpStatus.BAD_REQUEST, "BAD_REQUEST", ex.message ?: "Invalid request")
    }

    @ExceptionHandler(NoSuchElementException::class)
    fun handleNoSuchElementException(ex: NoSuchElementException): ResponseEntity<ErrorResponse> {
        log.warn("No such element: {}", ex.message)
        return buildResponse(HttpStatus.NOT_FOUND, "NOT_FOUND", ex.message ?: "Resource not found")
    }

    @ExceptionHandler(AccountStatusException::class)
    fun handleAccountStatusException(ex: AccountStatusException): ResponseEntity<ErrorResponse> {
        log.warn("Account status error: {} (code: {})", ex.message, ex.errorCode)
        return buildResponse(HttpStatus.FORBIDDEN, ex.errorCode, ex.message ?: "Account access denied")
    }

    @ExceptionHandler(ResponseStatusException::class)
    fun handleResponseStatusException(ex: ResponseStatusException): ResponseEntity<ErrorResponse> {
        val status = HttpStatus.valueOf(ex.getStatusCode().value())
        log.warn("Response status exception: {} {}", status.value(), ex.reason)
        return buildResponse(status, status.name, ex.reason ?: status.reasonPhrase)
    }

    // --- Validation ---

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleMethodArgumentNotValidException(ex: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val details = ex.bindingResult.fieldErrors.associate { it.field to (it.defaultMessage ?: "Invalid value") }
        log.warn("Validation failed: {}", details)
        return buildResponse(
            HttpStatus.BAD_REQUEST,
            "VALIDATION_ERROR",
            "입력값 검증에 실패했습니다",
            details
        )
    }

    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleHttpMessageNotReadableException(ex: HttpMessageNotReadableException): ResponseEntity<ErrorResponse> {
        log.warn("Malformed request body: {}", ex.message)
        return buildResponse(HttpStatus.BAD_REQUEST, "MALFORMED_REQUEST", "요청 본문을 읽을 수 없습니다")
    }

    // --- Spring Security exceptions ---

    @ExceptionHandler(org.springframework.security.core.AuthenticationException::class)
    fun handleAuthenticationException(ex: org.springframework.security.core.AuthenticationException): ResponseEntity<ErrorResponse> {
        log.warn("Authentication failed: {}", ex.message)
        return buildResponse(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", ex.message ?: "Authentication failed")
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException::class)
    fun handleAccessDeniedException(ex: org.springframework.security.access.AccessDeniedException): ResponseEntity<ErrorResponse> {
        log.warn("Access denied: {}", ex.message)
        return buildResponse(HttpStatus.FORBIDDEN, "ACCESS_DENIED", ex.message ?: "Access denied")
    }

    // --- Catch-all ---

    @ExceptionHandler(Exception::class)
    fun handleGenericException(ex: Exception): ResponseEntity<ErrorResponse> {
        log.error("Unexpected error", ex)
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "서버 내부 오류가 발생했습니다")
    }

    // --- Helper ---

    private fun buildResponse(
        status: HttpStatus,
        errorCode: String,
        message: String?,
        details: Map<String, String>? = null
    ): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(
            timestamp = LocalDateTime.now(),
            status = status.value(),
            error = status.reasonPhrase,
            errorCode = errorCode,
            message = message ?: "Unknown error",
            details = details
        )
        return ResponseEntity(errorResponse, status)
    }
}

data class ErrorResponse(
    val timestamp: LocalDateTime,
    val status: Int,
    val error: String,
    val errorCode: String,
    val message: String,
    val details: Map<String, String>? = null
)
