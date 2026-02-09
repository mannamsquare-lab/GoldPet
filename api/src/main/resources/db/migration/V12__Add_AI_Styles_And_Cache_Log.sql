-- AI Styles table (replaces hardcoded list in AIProfileService)
CREATE TABLE ai_styles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    preview_url VARCHAR(500),
    gold_cost INT NOT NULL DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed initial data from hardcoded styles
INSERT INTO ai_styles (id, name, description, preview_url, gold_cost, is_active, display_order) VALUES
('cartoon', '만화 스타일', '귀여운 만화풍으로 변환', '/styles/cartoon.jpg', 10, true, 1),
('watercolor', '수채화 스타일', '부드러운 수채화풍으로 변환', '/styles/watercolor.jpg', 15, true, 2),
('oil_painting', '유화 스타일', '클래식한 유화풍으로 변환', '/styles/oil.jpg', 20, true, 3),
('3d', '3D 캐릭터', '3D 캐릭터로 변환', '/styles/3d.jpg', 25, true, 4),
('anime', '애니메이션', '애니메이션 스타일로 변환', '/styles/anime.jpg', 15, true, 5);

-- Cache clear audit log
CREATE TABLE cache_clear_logs (
    id BIGSERIAL PRIMARY KEY,
    cache_name VARCHAR(100) NOT NULL,
    cleared_by VARCHAR(100) NOT NULL,
    cleared_at TIMESTAMP NOT NULL DEFAULT NOW(),
    reason VARCHAR(255)
);

CREATE INDEX idx_cache_clear_logs_cleared_at ON cache_clear_logs(cleared_at DESC);
