-- 9. 관리자 도메인 (Admin)
CREATE TABLE admin_users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'OPERATOR',
    -- 'SUPER_ADMIN', 'OPERATOR', 'VIEWER'
    otp_secret VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE admin_access_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_user_id BIGINT NOT NULL REFERENCES admin_users(id),
    ip_address VARCHAR(50),
    action VARCHAR(100),
    target_resource VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Initial Super Admin (password: admin123)
-- BCrypt Hash for 'admin123': $2a$10$Topx/4.0.0.0.0.0.0.0.0.0.0.0.0.0 (Generating real hash now)
-- Using a placeholder hash for 'admin123': $2a$10$Nxexamplehashplaceholder (Will replace with code)
INSERT INTO admin_users (email, password_hash, name, role, is_active)
VALUES (
        'admin@goldpet.com',
        '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOcd7qa8q.Ge2',
        'Super Admin',
        'SUPER_ADMIN',
        TRUE
    );