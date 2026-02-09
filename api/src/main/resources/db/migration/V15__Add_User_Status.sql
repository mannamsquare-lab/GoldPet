-- Add status column to users table
ALTER TABLE users ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

-- Backfill from is_active: inactive users become WITHDRAWN
UPDATE users SET status = 'WITHDRAWN' WHERE is_active = false;
