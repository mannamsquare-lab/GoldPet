-- chat_rooms 테이블 생성
CREATE TABLE chat_rooms (
    id BIGSERIAL PRIMARY KEY,
    room_type VARCHAR(20) NOT NULL, -- DIRECT, GROUP, AI_PET
    title VARCHAR(100),
    owner_user_id BIGINT REFERENCES users(id),
    match_id BIGINT REFERENCES matches(id), -- DIRECT 방일 경우 연관 매칭 ID
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- chat_room_participants 테이블 생성
CREATE TABLE chat_room_participants (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES chat_rooms(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    role VARCHAR(20) NOT NULL, -- OWNER, MEMBER
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    CONSTRAINT uq_chat_room_participant UNIQUE (room_id, user_id)
);

-- chat_messages 테이블 생성
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES chat_rooms(id),
    sender_user_id BIGINT REFERENCES users(id), -- 시스템 메시지는 NULL
    message_type VARCHAR(20) NOT NULL, -- TEXT, IMAGE, VIDEO, FILE, EMOTICON, EMOJI, SYSTEM
    text_content TEXT,
    file_id BIGINT REFERENCES file_attachments(id), -- file_attachments 테이블은 별도로 관리
    emoticon_id BIGINT, -- emoticons 테이블은 별도로 관리
    emoji_code VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_count INT NOT NULL DEFAULT 0
);

-- chat_messages 테이블 인덱스 추가
CREATE INDEX idx_chat_messages_room_id_created_at ON chat_messages (room_id, created_at);
