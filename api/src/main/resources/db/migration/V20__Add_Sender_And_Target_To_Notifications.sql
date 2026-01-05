-- Add missing columns to notifications table
ALTER TABLE notifications
ADD COLUMN target_id BIGINT,
    ADD COLUMN target_type VARCHAR(20),
    ADD COLUMN sender_id BIGINT,
    ADD COLUMN sender_nickname VARCHAR(50),
    ADD COLUMN sender_profile_image VARCHAR(500),
    ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
-- Add index for sender_id (optional but good for performance)
CREATE INDEX IF NOT EXISTS notifications_sender_id_idx ON notifications(sender_id);