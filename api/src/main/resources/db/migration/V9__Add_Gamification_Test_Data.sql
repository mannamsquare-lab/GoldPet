-- Seed Badges
INSERT INTO badges (code, name, description, image_url, created_at)
VALUES 
('FIRST_WALK', 'First Step', 'Awarded for your first walk.', 'https://goldpet.com/badges/first_walk.png', NOW())
ON CONFLICT (code) DO NOTHING;

-- Add missing column
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Seed Challenge
INSERT INTO challenges (title, description, goal_type, goal_value, reward_gold, start_date, end_date, is_active, created_at)
VALUES 
('Weekly 10km Walk', 'Walk 10km this week!', 'WALK_DISTANCE_TOTAL', 10000, 500, NOW() - INTERVAL '1 day', NOW() + INTERVAL '7 days', true, NOW());

-- Existing challenge might duplicate if run multiple times, but ID is serial. 
-- For local dev, this is acceptable.
