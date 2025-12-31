-- Add like_count to community_comments
ALTER TABLE community_comments
ADD COLUMN like_count INTEGER NOT NULL DEFAULT 0;
-- Create community_comment_likes table
CREATE TABLE community_comment_likes (
    id BIGSERIAL PRIMARY KEY,
    comment_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_comment_user UNIQUE (comment_id, user_id),
    CONSTRAINT fk_comment_likes_comment FOREIGN KEY (comment_id) REFERENCES community_comments(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Index for performance checks
CREATE INDEX idx_comment_likes_comment_user ON community_comment_likes(comment_id, user_id);