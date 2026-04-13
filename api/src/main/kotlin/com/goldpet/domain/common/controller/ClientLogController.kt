package com.goldpet.domain.common.controller

import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * 프론트엔드 런타임 오류(ErrorBoundary 등)를 서버 로그로 수집하는 경량 엔드포인트.
 * 디바이스에서 WebView 콘솔 접근이 어려운 릴리즈 빌드 대응용.
 */
@RestController
@RequestMapping("/api/v1/client-logs")
class ClientLogController {
    private val log = LoggerFactory.getLogger(ClientLogController::class.java)

    @PostMapping("/error")
    fun receiveClientError(
        @RequestBody body: ClientErrorPayload,
        @RequestHeader(value = "User-Agent", required = false) userAgent: String?,
    ): ResponseEntity<Void> {
        log.error(
            "[CLIENT-ERROR] url={} name={} message={} ua={}\nstack={}\ncomponentStack={}\nextra={}",
            body.url,
            body.name,
            body.message,
            userAgent,
            body.stack,
            body.componentStack,
            body.extra,
        )
        return ResponseEntity.noContent().build()
    }
}

data class ClientErrorPayload(
    val url: String? = null,
    val name: String? = null,
    val message: String? = null,
    val stack: String? = null,
    val componentStack: String? = null,
    val extra: Map<String, Any?>? = null,
)
