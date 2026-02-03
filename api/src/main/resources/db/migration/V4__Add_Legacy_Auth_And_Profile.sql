-- Add Legacy Auth and Extended Profile fields to users table
ALTER TABLE users
    ADD COLUMN username VARCHAR(50) UNIQUE,
    ADD COLUMN password VARCHAR(255),
    ADD COLUMN name VARCHAR(50),
    ADD COLUMN phone_number VARCHAR(20),
    ADD COLUMN birth_date DATE,
    ADD COLUMN intro TEXT,
    ADD COLUMN mbti VARCHAR(10),
    ADD COLUMN is_notification_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- Add comment on columns
COMMENT ON COLUMN users.username IS 'Legacy ID for Email/Password Login';
COMMENT ON COLUMN users.password IS 'Encrypted Password';
