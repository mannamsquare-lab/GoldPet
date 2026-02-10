package com.goldpet.domain.notification.service

import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

/**
 * FCM 푸시 알림 전송 인터페이스
 */
interface FcmPushSender {
    fun send(fcmToken: String, title: String, message: String, data: Map<String, String> = emptyMap()): Boolean
    fun sendToMultiple(fcmTokens: List<String>, title: String, message: String, data: Map<String, String> = emptyMap()): Int
}

/**
 * 로컬/개발/테스트 환경용 FCM 로깅 구현체
 */
@Component
@Profile("test")
class LoggingFcmPushSender : FcmPushSender {
    private val log = LoggerFactory.getLogger(javaClass)

    override fun send(fcmToken: String, title: String, message: String, data: Map<String, String>): Boolean {
        log.info("[FCM-MOCK] Sending push to token={}, title={}, message={}, data={}",
            fcmToken.take(20) + "...", title, message, data)
        return true
    }

    override fun sendToMultiple(fcmTokens: List<String>, title: String, message: String, data: Map<String, String>): Int {
        log.info("[FCM-MOCK] Sending push to {} devices, title={}, message={}", fcmTokens.size, title, message)
        return fcmTokens.size
    }
}
