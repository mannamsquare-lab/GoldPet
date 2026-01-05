CREATE TABLE interests (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    order_index INTEGER NOT NULL
);
CREATE TABLE hobbies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    order_index INTEGER NOT NULL
);
CREATE TABLE user_interests (
    user_id BIGINT NOT NULL,
    interest_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, interest_id),
    CONSTRAINT fk_user_interests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_interests_interest FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
);
CREATE TABLE user_hobbies (
    user_id BIGINT NOT NULL,
    hobby_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, hobby_id),
    CONSTRAINT fk_user_hobbies_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_hobbies_hobby FOREIGN KEY (hobby_id) REFERENCES hobbies(id) ON DELETE CASCADE
);
ALTER TABLE users
ADD COLUMN mbti VARCHAR(255);
ALTER TABLE users
ADD COLUMN intro TEXT;
ALTER TABLE users
ADD COLUMN has_pet BOOLEAN DEFAULT FALSE NOT NULL;