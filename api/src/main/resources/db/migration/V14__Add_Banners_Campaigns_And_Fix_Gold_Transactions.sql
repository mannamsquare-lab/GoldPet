-- 배너 관리 테이블
CREATE TABLE banners (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    image_url VARCHAR(500),
    link VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 캠페인 관리 테이블
CREATE TABLE campaigns (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    participant_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- gold_transactions 테이블: 엔티티와 동기화
-- 기존 컬럼 reason_code 은 유지 (데이터 보존), 새 컬럼 추가
ALTER TABLE gold_transactions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE gold_transactions ADD COLUMN IF NOT EXISTS reference_type VARCHAR(50);
ALTER TABLE gold_transactions ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED';
ALTER TABLE gold_transactions ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE gold_transactions ADD COLUMN IF NOT EXISTS external_transaction_id VARCHAR(255);
ALTER TABLE gold_transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 차트 집계 성능을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_gold_transactions_created_at ON gold_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_gold_transactions_type ON gold_transactions(type);
CREATE INDEX IF NOT EXISTS idx_walks_started_at ON walks(start_time);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
