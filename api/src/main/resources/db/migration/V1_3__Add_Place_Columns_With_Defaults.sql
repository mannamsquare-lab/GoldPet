-- Ensure Place columns exist and have defaults to support Entity definition and V2 Seed Data

-- 1. checkin_count
-- Add if missing (with default 0)
ALTER TABLE places ADD COLUMN IF NOT EXISTS checkin_count INT NOT NULL DEFAULT 0;
-- Ensure default is set (in case column existed but without default)
ALTER TABLE places ALTER COLUMN checkin_count SET DEFAULT 0;

-- 2. is_verified
-- Add if missing (with default false)
ALTER TABLE places ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE;
-- Ensure default is set
ALTER TABLE places ALTER COLUMN is_verified SET DEFAULT FALSE;
