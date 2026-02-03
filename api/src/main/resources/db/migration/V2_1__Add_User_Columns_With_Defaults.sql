-- Ensure User columns exist and have defaults to support Entity definition and V3 Test Data

-- 1. has_pet
-- Add if missing (with default false)
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_pet BOOLEAN NOT NULL DEFAULT FALSE;
-- Ensure default is set (in case column existed but without default)
ALTER TABLE users ALTER COLUMN has_pet SET DEFAULT FALSE;

-- 2. is_notification_enabled
-- Add if missing (with default true)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_notification_enabled BOOLEAN NOT NULL DEFAULT TRUE;
-- Ensure default is set
ALTER TABLE users ALTER COLUMN is_notification_enabled SET DEFAULT TRUE;
