-- Notification templates
CREATE TABLE notification_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    title_template VARCHAR(200) NOT NULL,
    message_template VARCHAR(1000) NOT NULL,
    type VARCHAR(50) NOT NULL,
    variables TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Push delivery logs
CREATE TABLE push_delivery_logs (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT REFERENCES notification_templates(id),
    title VARCHAR(200) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_value VARCHAR(500),
    target_count INT NOT NULL DEFAULT 0,
    delivered_count INT NOT NULL DEFAULT 0,
    failed_count INT NOT NULL DEFAULT 0,
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    sent_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_push_delivery_logs_status ON push_delivery_logs(status);
CREATE INDEX idx_push_delivery_logs_sent_at ON push_delivery_logs(sent_at DESC);
