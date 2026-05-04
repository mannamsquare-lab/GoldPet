#!/bin/bash
set -euo pipefail

# Phase 3: backup_jobs 큐에서 PENDING pickup → pg_dump → S3 업로드 → status 갱신
#
# 호출 패턴:
# 1) systemd timer 가 매일 03시 호출 (auto cron 모드: PENDING 없으면 새 row INSERT)
# 2) goldpet-backup-watcher.timer 가 1분 간격으로 PENDING 감시 (수동 trigger 신속 처리)
#
# 동시성 안전: SKIP LOCKED 로 여러 timer 가 동시에 실행돼도 중복 pickup 없음.
#
# Usage:
#   DB_HOST=localhost DB_PORT=5432 DB_NAME=goldpet_db DB_USER=goldpet \
#   PGPASSWORD=secret S3_BUCKET=goldpet-backups-dev ./run-backup.sh
#
# 환경변수는 /etc/goldpet/backup.env 에서 EnvironmentFile 로 주입됨.

###############################################################################
# Configuration
###############################################################################
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-goldpet_db}"
DB_USER="${DB_USER:-goldpet}"
S3_BUCKET="${S3_BUCKET:-goldpet-backups-dev}"

# PGPASSWORD 는 backup.env 의 DB_PASSWORD 에서 주입; 미설정 시 .pgpass 폴백
export PGPASSWORD="${PGPASSWORD:-${DB_PASSWORD:-}}"

PSQL="psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -At -v ON_ERROR_STOP=1"

###############################################################################
# Helpers
###############################################################################
log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# 임시 파일 정리 trap (성공·실패·신호 모두 처리)
DUMP_FILE=""
cleanup() {
    if [ -n "$DUMP_FILE" ] && [ -f "$DUMP_FILE" ]; then
        rm -f "$DUMP_FILE"
        log "Cleaned up temp file: $DUMP_FILE"
    fi
}
trap cleanup EXIT

###############################################################################
# 1. PENDING pickup (RUNNING 으로 원자 전환 — SKIP LOCKED 으로 race-safe)
###############################################################################
JOB_ID=$($PSQL -c "
    UPDATE backup_jobs SET status='RUNNING', started_at=NOW()
    WHERE id = (SELECT id FROM backup_jobs WHERE status='PENDING' ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED)
    RETURNING id;
") || true

if [ -z "$JOB_ID" ]; then
    # AUTO_CRON 모드: PENDING 없으면 신규 RUNNING row 생성 후 즉시 진행
    log "No PENDING job found — creating AUTO_CRON backup job..."
    JOB_ID=$($PSQL -c "
        INSERT INTO backup_jobs (status, trigger_type, started_at, created_at)
        VALUES ('RUNNING', 'AUTO_CRON', NOW(), NOW())
        RETURNING id;
    ")
fi

log "Picked up backup job: id=${JOB_ID}"

###############################################################################
# 2. pg_dump → gzip
###############################################################################
DATE=$(date +%Y-%m-%d-%H%M%S)
DUMP_FILE="/tmp/goldpet-${DATE}.sql.gz"
S3_KEY="${DATE}/dump.sql.gz"

log "Starting pg_dump → $DUMP_FILE"
if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -F p "$DB_NAME" | gzip > "$DUMP_FILE"; then
    log "pg_dump complete: $DUMP_FILE"

    ###########################################################################
    # 3. S3 업로드
    ###########################################################################
    log "Uploading to s3://${S3_BUCKET}/${S3_KEY} ..."
    if aws s3 cp "$DUMP_FILE" "s3://${S3_BUCKET}/${S3_KEY}"; then
        SIZE=$(stat -c%s "$DUMP_FILE" 2>/dev/null || stat -f%z "$DUMP_FILE")

        $PSQL -c "
            UPDATE backup_jobs
            SET status='SUCCEEDED', finished_at=NOW(),
                file_path='s3://${S3_BUCKET}/${S3_KEY}',
                file_size_bytes=${SIZE}
            WHERE id=${JOB_ID};
        "
        log "Backup ${JOB_ID} succeeded: s3://${S3_BUCKET}/${S3_KEY} (${SIZE} bytes)"
    else
        log "ERROR: S3 upload failed for job ${JOB_ID}"
        $PSQL -c "
            UPDATE backup_jobs
            SET status='FAILED', finished_at=NOW(), error_message='S3 upload failed'
            WHERE id=${JOB_ID};
        "
        exit 1
    fi
else
    log "ERROR: pg_dump failed for job ${JOB_ID}"
    $PSQL -c "
        UPDATE backup_jobs
        SET status='FAILED', finished_at=NOW(), error_message='pg_dump failed'
        WHERE id=${JOB_ID};
    "
    exit 1
fi
