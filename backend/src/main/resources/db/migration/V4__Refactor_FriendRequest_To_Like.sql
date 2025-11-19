-- friend_requests 테이블을 삭제합니다.
DROP TABLE IF EXISTS friend_requests;

-- likes 테이블을 생성합니다.
CREATE TABLE likes (
    id BIGSERIAL PRIMARY KEY,
    from_user_id BIGINT NOT NULL REFERENCES users(id),
    to_user_id BIGINT NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_likes_from_to UNIQUE (from_user_id, to_user_id)
);

-- matches 테이블에 status와 last_action_by 컬럼을 추가합니다.
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'MATCHED',
ADD COLUMN IF NOT EXISTS last_action_by BIGINT REFERENCES users(id);

-- 기존 matches 데이터에 기본 status 값을 설정해줍니다.
UPDATE matches SET status = 'MATCHED' WHERE status IS NULL;
