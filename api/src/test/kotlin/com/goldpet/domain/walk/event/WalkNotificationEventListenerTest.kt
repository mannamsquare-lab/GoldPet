package com.goldpet.domain.walk.event

import com.goldpet.domain.notification.service.NotificationService
import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.doThrow
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class WalkNotificationEventListenerTest {

    private lateinit var notificationService: NotificationService
    private lateinit var listener: WalkNotificationEventListener

    @BeforeEach
    fun setUp() {
        notificationService = mock()
        listener = WalkNotificationEventListener(notificationService)
    }

    private fun event(goldReward: Int, distanceKm: Double = 2.5) =
        WalkCompletedEvent(
            source = this,
            walkId = 42L,
            userId = 7L,
            followedCourseId = null,
            distanceKm = distanceKm,
            goldReward = goldReward
        )

    @Test
    fun `goldReward 양수면 보상-요약 푸시를 정확한 인자로 발송한다`() {
        listener.onWalkCompleted(event(goldReward = 30, distanceKm = 2.5))

        verify(notificationService, times(1))
            .notifyWalkCompleted(eq(7L), eq(42L), eq(2.5), eq(30))
    }

    @Test
    fun `goldReward 0이면 푸시를 발송하지 않는다`() {
        listener.onWalkCompleted(event(goldReward = 0))

        verify(notificationService, never())
            .notifyWalkCompleted(any(), any(), any(), any())
    }

    @Test
    fun `푸시 발송 실패는 best-effort로 삼켜져 예외가 전파되지 않는다`() {
        doThrow(RuntimeException("fcm down"))
            .whenever(notificationService)
            .notifyWalkCompleted(any(), any(), any(), any())

        assertDoesNotThrow { listener.onWalkCompleted(event(goldReward = 30)) }
    }
}
