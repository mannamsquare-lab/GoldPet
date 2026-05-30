package com.goldpet.domain.metrics

/**
 * A/B 코호트 — 메트릭 전반 공용(plan §1 W1).
 *
 * - [TREATMENT] / [CONTROL]: write-once 로 experiment_assignment 테이블에 영속(둘만 CHECK 허용).
 * - [NONE]: 미노출(미할당) 유저 — 테이블에 **절대 영속되지 않고** 서비스 read 반환값/like_events.cohort 에만 사용.
 *   NONE 은 A/B 분모에서 제외된다(NONE-fraction 은 validity 게이지로 노출).
 *
 * 단일 출처 — experiment_assignment(serving) 와 like_events 가 동일한 enum 을 공유하여
 * 코호트를 재계산하지 않고 같은 행에서 read 한다(guardrail #3).
 */
enum class Cohort {
    TREATMENT,
    CONTROL,
    NONE
}
