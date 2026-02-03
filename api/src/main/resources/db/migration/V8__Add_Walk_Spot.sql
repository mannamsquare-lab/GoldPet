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

CREATE INDEX IF NOT EXISTS idx_walks_user_id ON walks (user_id);
CREATE INDEX IF NOT EXISTS idx_walks_path ON walks USING GIST (path);
