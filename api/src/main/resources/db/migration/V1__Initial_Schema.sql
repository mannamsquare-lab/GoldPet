-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- =================================================================================================
-- 1. Users & Pets Domain
-- =================================================================================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    oauth_provider VARCHAR(50), -- KAKAO, NAVER, GOOGLE, APPLE
    oauth_id VARCHAR(255),
    nickname VARCHAR(50),
    gender VARCHAR(10),
    birth_year INT,
    main_location_text VARCHAR(255),
    main_location_geom geometry(Point, 4326),
    profile_image_url VARCHAR(500),
    gold_balance INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    UNIQUE (oauth_provider, oauth_id)
);

CREATE INDEX idx_users_main_location_geom ON users USING GIST (main_location_geom);

CREATE TABLE user_location_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    location_geom geometry(Point, 4326) NOT NULL,
    accuracy_m FLOAT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_location_history_user_id ON user_location_history(user_id);
CREATE INDEX idx_user_location_history_geom ON user_location_history USING GIST (location_geom);

CREATE TABLE pet_species (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- DOG, CAT
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pet_breeds (
    id SERIAL PRIMARY KEY,
    species_id INT NOT NULL REFERENCES pet_species(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pet_breeds_species_id ON pet_breeds(species_id);

CREATE TABLE pets (
    id BIGSERIAL PRIMARY KEY,
    owner_user_id BIGINT NOT NULL REFERENCES users(id),
    name VARCHAR(50) NOT NULL,
    species_id INT NOT NULL REFERENCES pet_species(id),
    breed_id INT NOT NULL REFERENCES pet_breeds(id),
    gender VARCHAR(10),
    birth_date DATE,
    weight_kg DECIMAL(4,1),
    is_neutered BOOLEAN,
    profile_image_url VARCHAR(500),
    temperament_tags VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pets_owner_user_id ON pets(owner_user_id);

CREATE TABLE pet_attribute_defs (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    species_id INT REFERENCES pet_species(id),
    data_type VARCHAR(20) NOT NULL, -- STRING, NUMBER, BOOLEAN, ENUM
    enum_values TEXT, -- JSON array string
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pet_attribute_values (
    id BIGSERIAL PRIMARY KEY,
    pet_id BIGINT NOT NULL REFERENCES pets(id),
    attribute_def_id INT NOT NULL REFERENCES pet_attribute_defs(id),
    value_string TEXT,
    value_number DECIMAL(10,2),
    value_boolean BOOLEAN,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================================
-- 2. Walk & Map Domain
-- =================================================================================================

CREATE TABLE walk_albums (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    cover_walk_id BIGINT, -- Late binding to walk_records
    visibility VARCHAR(20) NOT NULL DEFAULT 'PRIVATE', -- PUBLIC, FRIENDS, PRIVATE
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE walk_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    pet_id BIGINT NOT NULL REFERENCES pets(id),
    album_id BIGINT REFERENCES walk_albums(id),
    title VARCHAR(100),
    distance_m INT,
    duration_sec INT,
    user_calorie INT,
    pet_calorie INT,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP NOT NULL,
    route_geom geometry(LineString, 4326),
    center_point geometry(Point, 4326),
    visibility VARCHAR(20) NOT NULL DEFAULT 'PRIVATE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_walk_records_user_id ON walk_records(user_id);
CREATE INDEX idx_walk_records_route_geom ON walk_records USING GIST (route_geom);
CREATE INDEX idx_walk_records_center_point ON walk_records USING GIST (center_point);

CREATE TABLE walk_spots (
    id BIGSERIAL PRIMARY KEY,
    walk_id BIGINT NOT NULL REFERENCES walk_records(id),
    location_geom geometry(Point, 4326) NOT NULL,
    photo_url VARCHAR(500),
    memo TEXT,
    taken_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_walk_spots_geom ON walk_spots USING GIST (location_geom);

-- =================================================================================================
-- 3. Social Domain (Likes & Matches)
-- =================================================================================================

CREATE TABLE likes (
    id BIGSERIAL PRIMARY KEY,
    from_user_id BIGINT NOT NULL REFERENCES users(id),
    to_user_id BIGINT NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, CANCELED
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (from_user_id, to_user_id)
);

CREATE TABLE matches (
    id BIGSERIAL PRIMARY KEY,
    user1_id BIGINT NOT NULL REFERENCES users(id),
    user2_id BIGINT NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'MATCHED', -- MATCHED, BLOCKED, ENDED
    last_action_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (user1_id < user2_id),
    UNIQUE (user1_id, user2_id)
);

-- =================================================================================================
-- 4. Chat Domain
-- =================================================================================================

CREATE TABLE chat_rooms (
    id BIGSERIAL PRIMARY KEY,
    room_type VARCHAR(20) NOT NULL, -- DIRECT, GROUP, AI_PET
    title VARCHAR(100),
    owner_user_id BIGINT REFERENCES users(id),
    match_id BIGINT REFERENCES matches(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_room_participants (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES chat_rooms(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    UNIQUE (room_id, user_id)
);

CREATE TABLE file_attachments (
    id BIGSERIAL PRIMARY KEY,
    owner_user_id BIGINT NOT NULL REFERENCES users(id),
    file_type VARCHAR(20) NOT NULL, -- IMAGE, VIDEO, DOCUMENT
    mime_type VARCHAR(100),
    url VARCHAR(500) NOT NULL,
    size_bytes BIGINT,
    width INT,
    height INT,
    duration_sec INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE emoticon_packs (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_gold INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE emoticons (
    id BIGSERIAL PRIMARY KEY,
    pack_id BIGINT NOT NULL REFERENCES emoticon_packs(id),
    code VARCHAR(50),
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES chat_rooms(id),
    sender_user_id BIGINT REFERENCES users(id), -- NULL for system messages
    message_type VARCHAR(20) NOT NULL, -- TEXT, IMAGE, VIDEO, FILE, EMOTICON, SYSTEM
    text_content TEXT,
    file_id BIGINT REFERENCES file_attachments(id),
    emoticon_id BIGINT REFERENCES emoticons(id),
    emoji_code VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_count INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_chat_messages_room_created ON chat_messages(room_id, created_at);

-- =================================================================================================
-- 5. Community Domain
-- =================================================================================================

CREATE TABLE community_categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE community_posts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    category_id INT NOT NULL REFERENCES community_categories(id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    visibility VARCHAR(20) DEFAULT 'PUBLIC',
    post_type VARCHAR(20) NOT NULL DEFAULT 'GENERAL', -- GENERAL, QUESTION, INFO
    is_answered BOOLEAN DEFAULT FALSE,
    view_count INT NOT NULL DEFAULT 0,
    like_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE community_post_images (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES community_posts(id),
    file_id BIGINT NOT NULL REFERENCES file_attachments(id),
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE community_comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES community_posts(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    parent_comment_id BIGINT REFERENCES community_comments(id),
    content TEXT NOT NULL,
    is_selected_answer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Update post's adopted_comment linking if needed (usually handled by update query + is_answered flag)

CREATE TABLE community_post_likes (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES community_posts(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (post_id, user_id)
);

-- =================================================================================================
-- 6. Economy Domain
-- =================================================================================================

CREATE TABLE gold_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL, -- CHARGE, USE, REFUND
    amount INT NOT NULL,
    balance_after INT NOT NULL,
    reason_code VARCHAR(50),
    reference_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE iap_receipts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    platform VARCHAR(20) NOT NULL, -- GOOGLE, APPLE
    receipt_data TEXT NOT NULL,
    order_id VARCHAR(100),
    purchased_gold INT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================================
-- 7. AI Domain
-- =================================================================================================

CREATE TABLE ai_profile_jobs (
    id BIGSERIAL PRIMARY KEY,
    pet_id BIGINT NOT NULL REFERENCES pets(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    style VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    input_image_id BIGINT REFERENCES file_attachments(id),
    result_image_id BIGINT REFERENCES file_attachments(id),
    result_video_id BIGINT REFERENCES file_attachments(id),
    used_gold INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- =================================================================================================
-- 8. Notifications Domain
-- =================================================================================================

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    payload_json JSONB,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- =================================================================================================
-- 9. Gamification Domain (v2.1 NEW)
-- =================================================================================================

CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- FIRST_WALK, 10KM_WALKER
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_badges (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    badge_id INT NOT NULL REFERENCES badges(id),
    acquired_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, badge_id)
);

CREATE TABLE challenges (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    goal_type VARCHAR(50) NOT NULL, -- DISTANCE, WALK_COUNT, CHECK_IN
    goal_value INT NOT NULL,
    reward_gold INT DEFAULT 0,
    reward_badge_id INT REFERENCES badges(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_challenge_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    challenge_id INT NOT NULL REFERENCES challenges(id),
    current_value INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, FAILED, CLAIMED
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, challenge_id)
);

-- =================================================================================================
-- 10. Places Domain (v2.1 NEW)
-- =================================================================================================

CREATE TABLE places (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- PARK, CAFE, HOSPITAL
    description TEXT,
    address VARCHAR(255),
    location_geom geometry(Point, 4326) NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_places_geom ON places USING GIST (location_geom);

CREATE TABLE check_ins (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    place_id INT NOT NULL REFERENCES places(id),
    visit_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_check_ins_user_date ON check_ins(user_id, visit_date);
