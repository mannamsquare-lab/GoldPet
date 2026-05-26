# GoldPet 상용 출시 BLOCKER 13건 Sprint 분할 실행 계획

> 작성일: 2026-05-26
> 근거 문서: `docs/GoldPet_상용출시_사전평가_v2.md` (v2.1 patched, Critic APPROVED)
> 전제: 옵션 A (베타 IAP OFF 우선 출시) 채택

---

## 개요

평가 v2.1의 BLOCKER 13건은 18개 raw 항목(BE 10 + FE 3 + Flutter 3 + 플랫폼 2)을 **공유 의존성 기반 epic 13개**로 통합한 결과입니다. 분할 원칙:

1. **관측·백업 먼저** (원칙 #5 운영 가능성): Sentry/BCP 없이 다른 BLOCKER를 처리하면 회귀 탐지 불가 → Sprint 1 우선.
2. **결제·인증·인가 = critical path**: 마이그레이션이 V65(Idempotency)→V66(JWT)→V67(OAuth)→V68(Chat)→V69-V70(Admin) 순서로 production data에 닿음 → 의존성 chain 단순화.
3. **UGC 모더레이션(Sprint 3)은 절대 미룰 수 없음**: Apple Guideline 1.2 위반 시 심사 즉시 reject → 회사 계정 전환 완료 시점과 sync 필요.

총 추정 공수 ~50 PD, 5인 팀 × 4주 = 100 PD capacity → 일정 마진 있음. **Critical risk는 JWT rotation (BE 5d → FE 2d → Flutter 2d 순차 9 PD)** — Sprint 1 후반부터 BE 작업 사전 착수 권장.

---

## Sprint 0 — 사전 셋업 (3일)

| 항목 | 담당 | 산출물 |
|---|---|---|
| 결제 시나리오 확정 (옵션 A = 베타 IAP OFF) | Product Owner | 의사결정 문서 |
| Sentry DSN 4 환경 발급 (api/frontend/admin/flutter × dev/prod) | Ops | DSN 키 + env 매트릭스 |
| 회사 계정 전환 트랙 가동 (병렬 트랙) | Ops + PO | `GoldPet_상용출시_회사계정전환_플랜.md` Week 0 시작 |
| `docs/product_roadmap_post_launch.md` 분리 생성 (§3 8개 이관) | Product | 백로그 분리 완료 |
| Grafana 대시보드 4 패널 사전 셋업 (`walks_complete_p95`, `gold_daily_reconciliation`, `fcm_delivery_rate`, `refresh_token_rotation_count`) | Ops | 빈 대시보드 |

---

## Sprint 1 (Week 1) — 관측 + 백업 + 결제 정합성 + JWT 사전 착수

| # | Epic | 담당 | PD | 마이그레이션 | Acceptance |
|---|---|---|---|---|---|
| 9 | **Sentry SDK 4 프로젝트 통합** | BE+FE+Admin+Flutter Lead 병렬 | 2 lead time | — | 4 프로젝트 모두 init confirmed 이벤트 Sentry 콘솔 도달, release tag + source map upload |
| 10 | **BCP runbook + RDS PITR** | Ops Lead | 3 | — | `deploy-dev/runbooks/db-recovery.md` 작성, RDS automated backup 7d/PITR 활성화 검증, 분기 drill schedule 등록 |
| 1 | **Idempotency-Key V65** | Backend Lead | 4 | **V65** `gold_idempotency_keys` (status/request_hash/response_body) | 100 thread × 50회 동시성 중복 0건, 409/422 정상 응답, p95 <500ms |
| 2-a | **JWT rotation V66 BE 사전 착수** | Backend Lead | 5 (Sprint 2까지 spill) | **V66** `user_refresh_tokens` (parent chain + grace window) | reuse detection 동작, 5초 grace window 동일 device 멱등 |

**Gate**: Sentry 통합 완료 후 모든 후속 sprint 작업은 release tag 의무.

---

## Sprint 2 (Week 2) — 인증·인가 완성

| # | Epic | 담당 | PD | 마이그레이션 | Acceptance |
|---|---|---|---|---|---|
| 2-b | **JWT rotation FE 적용** | FE Lead | 2 | — | axios interceptor에서 new refresh 즉시 저장, parent chain client 보존 |
| 2-c | **JWT rotation Flutter 적용** | Flutter Lead | 2 | — | `auth_service.dart` 동일 device race mutex + grace window 흡수 |
| 3 | **OAuth nonce V67** | Backend Lead | 3 | **V67** `oauth_nonces` (DB primary + Redis cache-aside) | 1회용 검증 통과, replay 차단 401, Redis 장애 시도 DB로 fallback 동작 |
| 7 | **Admin 2FA + IP allowlist + audit log** | BE Lead + FE Lead + Ops 병렬 | 7 | **V69** `admin_totp_secrets`, **V70** `admin_audit_logs` | nginx IP whitelist 외부 차단, TOTP 등록/검증, AOP `@AdminAction` 모든 mutation 기록 |

**Gate**: Sprint 2 종료 시 인증/인가 BLOCKER 전체 closure → Sprint 3 보안 회귀 free.

---

## Sprint 3 (Week 3) — UGC 모더레이션 + 산책 무결성

| # | Epic | 담당 | PD | 마이그레이션 | Acceptance |
|---|---|---|---|---|---|
| 5 | **Chat 모더레이션 V68 + FE 신고/차단 UI** | BE Lead → FE Lead 순차 | 4 + 3 | **V68** `chat_reports` (reason enum, status, hidden_at) | 3건 누적 자동 hide, admin queue 등록, 24h SLA timer, FE 채팅방 신고/차단 모달 |
| 4 | **Walk 종료 트랜잭션 통합 + outbox** | Backend Lead | 3 | — | walk + walk_photo + gold reward 단일 `@Transactional`, 도메인 이벤트 outbox 적재, 부분 실패 0건 |
| 6 | **EXIF 전 mime strip** | Backend Lead | 2 | — | `metadata-extractor` 도입, JPEG/HEIC/PNG/WebP 4종 업로드 후 exiftool 검증 GPS 메타 0% |
| 11 | **Walk dispose 회귀 테스트** | Flutter Lead | 1 | — | `walk_screen_dispose_test.dart` 3 케이스 추가 + multi-device eviction integration_test 신규 |

**Gate**: Apple Guideline 1.2 충족 (UGC report+block+24h SLA + published contact) — TestFlight 사전 검토 대비.

---

## Sprint 4 (Week 4) — 푸시·동기화·안정화

| # | Epic | 담당 | PD | 마이그레이션 | Acceptance |
|---|---|---|---|---|---|
| 8 | **FCM 통합 (무효 cleanup + 토큰 sync + multi-device push 검증)** | BE Lead + Flutter Lead 병렬 | 4 | — | `UnregisteredException` catch → `user_devices.deleted_at`, `onTokenRefresh` → `PUT /users/me/fcm-token` 100% 동기화, V17 multi-device fan-out 회귀 |
| 12 | **골드 잔액 multi-device sync (polling 3s + ETag)** | BE Lead + FE Lead | 2 | — | `GET /users/me/gold` ETag 응답, 304 비율 ≥80%, 잔액 stale ≤5초 |
| 13 | **산책 종료 multi-device push 검증** | BE Lead + Flutter Lead | 1 | — | 2기기 동시 로그인 시나리오 → 두 기기 모두 종료 push 도달 |
| — | **통합 회귀 + closed test 진입 prep** | 전원 + QA Lead | 3 | — | §4 QA 시나리오 5개 PASS, 4계층 테스트 KPI 충족 (Unit ≥70%, Integration 100 thread, E2E Playwright 통과율 100%) |

**Gate**: 4계층 테스트 KPI 충족 + Sentry critical 0건 → Sprint 5 closed test 진입.

---

## Sprint 5-6 (Week 5-6) — 14일 Closed Test

| 활동 | 책임자 | 합격 기준 |
|---|---|---|
| TestFlight 8명 + Play Internal Testing 14일 | Product + Ops | Apple/Google 모두 빌드 승인 |
| 일일 09:00 KPI 리뷰 (Crash-free / ANR / p95 / FCM / Sentry critical) | Backend Lead + Ops Lead | KPI 2일 연속 미달 시 출시 연기 의사결정 |
| 골드 일별 정합성 reconciliation 수동 검증 | Backend Lead | 일별 SUM 불일치 0건 |
| 회사 계정 전환 완료 검증 | Ops + Legal | Apple Dev Org / Play Org / Kakao Business 모두 활성 |
| 정식 제출 전 final security audit | Ops + 외부 | OWASP top 10 0건, PII 노출 0건 |

**최종 합격 기준 (v2.1 §0 KPI 표)**: Crash-free ≥99.5%, ANR <0.47%, 결제 성공률 ≥98%, walks_complete p95 <800ms, FCM 도달률 ≥95% (30s 내), Sentry critical 0건.

---

## 마이그레이션 일정 (V65 → V70)

| Version | Sprint | 내용 | 대상 환경 순서 |
|---|---|---|---|
| **V65** | 1 | `gold_idempotency_keys` (status/request_hash) | local → dev → closed test → prod |
| **V66** | 1-2 | `user_refresh_tokens` (parent chain + grace window) | local → dev → closed test → prod |
| **V67** | 2 | `oauth_nonces` (DB primary) | local → dev → closed test → prod |
| **V68** | 3 | `chat_reports` (reason enum + auto-hide) | local → dev → closed test → prod |
| **V69** | 2 | `admin_totp_secrets` | local → dev → closed test → prod |
| **V70** | 2 | `admin_audit_logs` | local → dev → closed test → prod |

**규칙**: 모든 마이그레이션은 `feedback_flyway_concurrently.md` 규칙 준수 (CONCURRENTLY 필요 시 `executeInTransaction=false` + `IF NOT EXISTS`). V65-V70은 모두 신규 테이블이라 트랜잭션 안전 (CONCURRENTLY 불필요).

---

## 의존성 + 리스크

| 리스크 | 영향 | 완화 |
|---|---|---|
| **JWT rotation 9 PD critical path 슬립** | Sprint 2 → Sprint 3 슬립 → 전체 1주 지연 | Sprint 1 후반 BE 사전 착수 (이미 반영), FE/Flutter는 BE PR merge 즉시 병렬 시작 |
| **Sentry SDK 도입 시 dev 환경 노이즈 폭발** | 진짜 critical 묻힘 | Sprint 1에 alert rule 사전 셋업 + dev DSN 별도 분리 + sampling 0.1 |
| **회사 계정 전환 지연** (외부 의존: Apple D-U-N-S, Kakao Business 심사) | Sprint 5 closed test 시작 불가 | Sprint 0부터 병렬 트랙 + Kakao 심사 1순위 (1-2주 소요) |
| **Chat 모더레이션 admin queue UI 누락** | Apple 1.2 부분 충족 → 심사 반려 위험 | Sprint 3 종료 전 admin queue 화면 minimum viable (목록 + status 변경)만이라도 출시 |
| **closed test 14일 중 KPI 미달** | 출시 연기 | 일일 09:00 리뷰에서 즉시 hot-fix sprint 발동 + 거버넌스 트리거 |

---

## 다음 액션

1. **Sprint 0 즉시 시작** — Product Owner가 옵션 A 결재 확정 → Ops가 Sentry DSN 4건 발급 + 회사 계정 전환 트랙 가동.
2. **Sprint 1 kickoff 미팅** — BE/FE/Flutter/Ops Lead 동시 시작, JWT BE 사전 착수 결정.
3. **§3 백로그 분리** — `docs/product_roadmap_post_launch.md`로 §3 8개 이관 (Product 담당).
4. **Sprint 진행 추적** — 각 sprint 종료 시 본 문서 하단에 sprint retrospective 추가.

---

## Sprint Retrospective (실행 중 채워나갈 섹션)

### Sprint 0
- **시작일**: 2026-05-26
- **종료 목표**: 2026-05-30 (3일)
- **완료 항목** (현재):
  - ✅ `docs/product_roadmap_post_launch.md` 분리 생성 (§3 8개 이관, 우선순위 P0-P3)
  - ✅ `docs/ADR-001-option-A-beta-launch.md` 작성 (PO 결재 대기)
  - ✅ `docs/runbook_sentry_setup.md` 작성 (Sprint 1 SDK 통합 사전 준비)
  - ✅ `docs/runbook_grafana_launch_dashboard.md` 작성 (4 핵심 패널 PromQL + alert rule)
  - ✅ `docs/corporate_account_progress_tracker.md` 작성 (Week 0-10 58개 항목 체크리스트)
- **PO 결재 대기**:
  - ⏳ ADR-001 옵션 A 결재 (Product Owner + CTO + Ops Lead 서명)
- **외부 작업 대기** (담당자 실행 필요):
  - ⏳ Sentry 조직 가입 + 4 프로젝트 DSN 8개 발급 (Ops)
  - ⏳ Google Play Console Organization 가입 ($25, Ops)
  - ⏳ Apple Developer Program Organization 가입 ($99, Ops)
  - ⏳ Kakao 비즈앱 심사 신청 (1-2주 critical path, Ops)
  - ⏳ 회사 도메인 메일 분리 생성 (Ops)
  - ⏳ Grafana 빈 대시보드 셋업 + JSON git commit (Ops)
- **학습 / 회고**: TBD (Sprint 0 종료 후 작성)

### Sprint 1
(이하 동일)

### Sprint 2

### Sprint 3

### Sprint 4

### Sprint 5-6 (Closed Test)
