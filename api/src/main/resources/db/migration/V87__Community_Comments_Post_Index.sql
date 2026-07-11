-- flyway:executeInTransaction=false
--
-- W2/PERF-002 — community_comments.post_id 핫패스 커버 인덱스 (CONCURRENTLY).
--
-- ## 배경
-- `CommunityCommentRepository` 의 countByPostId / existsByPostIdAndUserId / findByPostId... 는 모두
-- `post_id` 필터를 수행하나 PostgreSQL 은 FK 컬럼을 자동 인덱싱하지 않는다(V1 스키마에 post_id 인덱스 없음).
-- 커뮤니티 피드 로드는 게시글 수만큼 이 쿼리를 반복(PERF-004)하므로 seq scan 비용이 게시글 수만큼 배가된다.
-- 대부분의 조회가 숨김 제외(`is_hidden=false`)를 함께 필터하므로 `(post_id, is_hidden)` 복합 인덱스로
-- 댓글수 집계·존재여부 쿼리를 인덱스 온리에 가깝게 커버한다.
--
-- ## 운영 주의
-- `CREATE INDEX CONCURRENTLY` 는 트랜잭션 내부에서 실행 불가 → 상단 `flyway:executeInTransaction=false`
-- 지시자로 이 마이그레이션을 비트랜잭션 모드로 실행.
--
-- ### 적대적 리뷰 MEDIUM 후속 — INVALID 인덱스 은닉 방지
-- `CREATE INDEX CONCURRENTLY` 가 빌드 도중 실패(세션 종료·advisory lock 대기 중 취소 등)하면
-- Postgres 는 그 인덱스를 **이름만 등록된 INVALID 상태**로 남긴다(사용되지 않고 쓰기 오버헤드만
-- 유발). 이후 재시도에서 `CREATE INDEX CONCURRENTLY IF NOT EXISTS` 는 "동일 이름이 이미 존재"로
-- 판단해 **그대로 스킵** — 깨진 인덱스가 "성공"으로 위장되어 영구 잔존한다. 이를 막기 위해
-- CREATE 직전에 `DROP INDEX CONCURRENTLY IF EXISTS` 로 선행 실패분을 제거한 뒤 재생성한다.
-- `DROP INDEX CONCURRENTLY` 도 트랜잭션 밖에서만 가능하므로 이 파일의 `executeInTransaction=false`
-- 로 함께 커버된다. (매 실행마다 DROP 후 CREATE 하므로 최초 성공본까지 재생성되지만, 인덱스가 이미
-- VALID 하면 DROP→CREATE 재실행은 idempotent 하게 동일 인덱스를 다시 만들 뿐이라 안전 — 다만 그
-- 짧은 구간 동안 인덱스가 부재하므로 쿼리는 seq scan 으로 일시 폴백된다, 데이터 정합성 영향 없음.)
--
-- ### Runbook: CONCURRENTLY 무한 대기 시
-- `CREATE INDEX CONCURRENTLY` 는 Postgres 서버 쪽 advisory lock 을 대기하므로, 이전 세션의
-- idle-in-transaction 연결이 남아 있으면 무한 대기한다. dev/local 에서 apply 실패 시 아래 실행 후 재시도:
--   SELECT pg_terminate_backend(pid) FROM pg_stat_activity
--    WHERE application_name LIKE 'PostgreSQL%' AND datname = 'goldpet';
-- (`Jenkinsfile` / `deploy-api.sh` 2026-04-21 업데이트분에 자동 포함됨.)
--
-- ### Runbook: 배포 후 INVALID 인덱스 확인
-- 배포 직후(또는 위 hang 대응 후) 아래로 인덱스가 VALID 상태인지 확인한다:
--   SELECT indexrelid::regclass, indisvalid FROM pg_index
--    WHERE indexrelid = 'idx_community_comments_post_id_hidden'::regclass;
-- `indisvalid = f` 이면(예: 배포 스크립트가 CONCURRENTLY 빌드 도중 강제 종료된 경우) 위 DROP
-- CONCURRENTLY 구문을 수동 재실행한 뒤 이 마이그레이션을 재적용(또는 `CREATE INDEX CONCURRENTLY`
-- 를 직접 재실행)한다 — 이름만 있는 깨진 인덱스는 `IF NOT EXISTS` 로 절대 자동 복구되지 않는다.

DROP INDEX CONCURRENTLY IF EXISTS idx_community_comments_post_id_hidden;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_community_comments_post_id_hidden
    ON community_comments (post_id, is_hidden);
