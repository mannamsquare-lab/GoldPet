-- V2__Add_User_Credentials.sql
-- Add columns for traditional authentication
ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN password VARCHAR(255);

-- Ensure existing rows have null values (default) for new columns
UPDATE users SET username = NULL, password = NULL;
