DROP TABLE IF EXISTS walk_spots;
-- Drop walk_records only if it exists (legacy)
DROP TABLE IF EXISTS walk_records;

CREATE TABLE IF NOT EXISTS walks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    distance_km DOUBLE PRECISION NOT NULL,
    duration_seconds BIGINT NOT NULL,
    path geometry(LineString, 4326) NOT NULL,
    calories_burned DOUBLE PRECISION,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_walks_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Ensure columns exist if table already existed (Zombie Schema Protection)
ALTER TABLE walks ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW();
ALTER TABLE walks ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW();
ALTER TABLE walks ADD COLUMN IF NOT EXISTS distance_km DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE walks ADD COLUMN IF NOT EXISTS duration_seconds BIGINT NOT NULL DEFAULT 0;
ALTER TABLE walks ADD COLUMN IF NOT EXISTS path geometry(LineString, 4326); 
-- Note: 'path' might fail NOT NULL check if added effectively to empty rows, but for new table it is fine.
-- If table exists with data but no path, we have a problem. But assuming zombie table is empty or compatible.
ALTER TABLE walks ADD COLUMN IF NOT EXISTS calories_burned DOUBLE PRECISION;
ALTER TABLE walks ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE TABLE IF NOT EXISTS walk_spots (
    id BIGSERIAL PRIMARY KEY,
    walk_id BIGINT NOT NULL,
    location geometry(Point, 4326) NOT NULL,
    type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    image_url VARCHAR(255),
    note TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_walk_spots_walk FOREIGN KEY (walk_id) REFERENCES walks (id) ON DELETE CASCADE
);

-- Ensure columns exist for walk_spots
ALTER TABLE walk_spots ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);
ALTER TABLE walk_spots ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE walk_spots ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITHOUT TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_walks_user_id ON walks (user_id);
CREATE INDEX IF NOT EXISTS idx_walks_path ON walks USING GIST (path);
