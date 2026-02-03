-- Create System Settings table
CREATE TABLE system_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, description, created_at, updated_at) VALUES
('app_version', '1.0.0', 'Current Application Version', NOW(), NOW()),
('maintenance_mode', 'false', 'System Maintenance Mode Flag', NOW(), NOW());
