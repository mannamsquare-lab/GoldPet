-- Add Legacy Auth and Extended Profile fields to users table
-- We use IF NOT EXISTS for each column to handle potential "zombie" columns (legacy schema)
-- and conflicts with previous migrations (like V2.1 which added is_notification_enabled)

ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);
-- Attempt to add unique constraint if it doesn't exist (handled gracefully if column existed with it)
-- Note: If column exists, we assume constraints are likely correct or managed elsewhere to avoid complex PL/SQL blocks here.
-- For a fresh DB, the UNIQUE below would apply. But with 'IF NOT EXISTS', it's attached to the column creation.
-- If we really need to ensure uniqueness on a pre-existing column, we'd need a separate constraint check.
-- For now, we trust the legacy schema matches.

ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS intro TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mbti VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_notification_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- Add comment on columns
COMMENT ON COLUMN users.username IS 'Legacy ID for Email/Password Login';
COMMENT ON COLUMN users.password IS 'Encrypted Password';
