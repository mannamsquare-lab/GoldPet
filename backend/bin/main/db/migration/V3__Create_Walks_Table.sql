CREATE TABLE walks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    distance_km DOUBLE PRECISION NOT NULL,
    duration_seconds BIGINT NOT NULL,
    path GEOMETRY(LineString, 4326) NOT NULL,
    calories_burned DOUBLE PRECISION,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_walks_user_id ON walks (user_id);
CREATE INDEX idx_walks_path ON walks USING GIST (path);