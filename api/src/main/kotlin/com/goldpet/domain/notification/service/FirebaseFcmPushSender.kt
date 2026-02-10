package com.goldpet.domain.notification.service

import com.google.firebase.FirebaseApp
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.Message
import com.google.firebase.messaging.MulticastMessage
import com.google.firebase.messaging.Notification
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

/**
 * Firebase Admin SDK를 사용한 실제 FCM 푸시 전송
 */
@Component
@Profile("local", "dev", "prod")
class FirebaseFcmPushSender : FcmPushSender {
    private val log = LoggerFactory.getLogger(javaClass)

    override fun send(fcmToken: String, title: String, message: String, data: Map<String, String>): Boolean {
        return try {
            val notification = Notification.builder()
                .setTitle(title)
                .setBody(message)
                .build()

            val fcmMessage = Message.builder()
                .setToken(fcmToken)
                .setNotification(notification)
                .putAllData(data)
                .build()

            val response = FirebaseMessaging.getInstance().send(fcmMessage)
            log.info("[FCM] Push sent successfully: {}", response)
            true
        } catch (e: Exception) {
            log.error("[FCM] Failed to send push to token={}: {}", fcmToken.take(20), e.message)
            false
        }
    }

    override fun sendToMultiple(fcmTokens: List<String>, title: String, message: String, data: Map<String, String>): Int {
        if (fcmTokens.isEmpty()) return 0

        return try {
            val notification = Notification.builder()
                .setTitle(title)
                .setBody(message)
                .build()

            // FCM allows max 500 tokens per multicast
            var successCount = 0
            fcmTokens.chunked(500).forEach { chunk ->
                val multicastMessage = MulticastMessage.builder()
                    .addAllTokens(chunk)
                    .setNotification(notification)
                    .putAllData(data)
                    .build()

                val response = FirebaseMessaging.getInstance().sendEachForMulticast(multicastMessage)
                successCount += response.successCount
                if (response.failureCount > 0) {
                    log.warn("[FCM] {} failures in multicast send", response.failureCount)
                }
            }
            log.info("[FCM] Multicast push sent: {}/{} successful", successCount, fcmTokens.size)
            successCount
        } catch (e: Exception) {
            log.error("[FCM] Failed multicast send: {}", e.message)
            0
        }
    }
}
