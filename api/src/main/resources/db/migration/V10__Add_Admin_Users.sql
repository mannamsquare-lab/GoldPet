-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'OPERATOR',
    otp_secret VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Admin Access Logs Table
CREATE TABLE IF NOT EXISTS admin_access_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_user_id BIGINT NOT NULL REFERENCES admin_users(id),
    ip_address VARCHAR(50),
    action VARCHAR(100),
    target_resource VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Initial Super Admin (password: admin123)
INSERT INTO admin_users (email, password_hash, name, role, is_active, created_at, updated_at)
VALUES (
    'admin@goldpet.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.wGexMxJ6nBdLzjhFKW',
    '최고관리자',
    'SUPER_ADMIN',
    true,
    NOW(),
    NOW()
);
