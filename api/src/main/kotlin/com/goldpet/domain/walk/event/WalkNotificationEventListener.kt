package com.goldpet.domain.walk.event

import com.goldpet.domain.notification.service.NotificationService
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

/**
 * 산책 완료 보상-요약 푸시 리스너 (해석 A).
 *
 * ## 실행 모델
 * - `@TransactionalEventListener(phase = AFTER_COMMIT)` — `WalkService.createWalk` DB 커밋 이후에만 실행.
 *   산책 저장/골드 적립이 롤백되면 푸시도 발송되지 않음 (잘못된 보상 알림 방지).
 * - `@Async("walkNotificationExecutor")` — 별도 풀에서 비동기 처리 → `walks_complete_p95`(<800ms) hot path 와
 *   FCM 송신을 디커플. 푸시 지연/실패가 산책 종료 응답에 영향 없음.
 *
 * ## 게이팅
 * `goldReward > 0` 일 때만 발송 — 보상 요약 푸시이므로 보상이 없는(임계 미달) 산책은 알리지 않음.
 *
 * ## 트랜잭션 경계
 * `@Async` 스레드는 호출자 tx 컨텍스트를 공유하지 않음. `notificationService.notifyWalkCompleted` 가
 * 내부 `@Transactional` 로 자체 tx 개설 (Notification save + FCM fan-out). best-effort: 실패는 로그만 남기고
 * 드롭 (보상은 이미 커밋된 산책 tx 에서 적립됨 — 푸시는 부가 알림).
 */
@Component
class WalkNotificationEventListener(
    private val notificationService: NotificationService
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Async("walkNotificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun onWalkCompleted(event: WalkCompletedEvent) {
        if (event.goldReward <= 0) return
        try {
            notificationService.notifyWalkCompleted(
                userId = event.userId,
                walkId = event.walkId,
                distanceKm = event.distanceKm,
                goldReward = event.goldReward
            )
        } catch (e: Exception) {
            log.warn(
                "Walk-completed push failed (best-effort, dropped): walkId={} userId={}: {}",
                event.walkId, event.userId, e.message
            )
        }
    }
}
