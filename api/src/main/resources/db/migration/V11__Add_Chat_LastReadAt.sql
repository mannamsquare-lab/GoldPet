-- Add last_read_at column to chat_room_participants table
ALTER TABLE chat_room_participants ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP;
