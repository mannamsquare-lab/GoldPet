-- Create Interests table
CREATE TABLE IF NOT EXISTS interests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    order_index INT NOT NULL DEFAULT 0
);

-- Create Hobbies table
CREATE TABLE IF NOT EXISTS hobbies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    order_index INT NOT NULL DEFAULT 0
);

-- Create User <-> Interests Join Table
CREATE TABLE IF NOT EXISTS user_interests (
    user_id BIGINT NOT NULL,
    interest_id INT NOT NULL,
    PRIMARY KEY (user_id, interest_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
);

-- Create User <-> Hobbies Join Table
CREATE TABLE IF NOT EXISTS user_hobbies (
    user_id BIGINT NOT NULL,
    hobby_id INT NOT NULL,
    PRIMARY KEY (user_id, hobby_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hobby_id) REFERENCES hobbies(id) ON DELETE CASCADE
);

-- Seed Data for Interests (Safe Insert)
INSERT INTO interests (name, order_index) VALUES
('산책', 1),
('여행', 2),
('사진', 3),
('카페투어', 4),
('등산', 5),
('러닝', 6),
('캠핑', 7),
('맛집탐방', 8)
ON CONFLICT (name) DO NOTHING;

-- Seed Data for Hobbies (Safe Insert)
INSERT INTO hobbies (name, order_index) VALUES
('독서', 1),
('게임', 2),
('영화감상', 3),
('요리', 4),
('음악감상', 5),
('운동', 6)
ON CONFLICT (name) DO NOTHING;
