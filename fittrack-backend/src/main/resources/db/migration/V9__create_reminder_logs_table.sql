-- V9: Create reminder_logs table
-- Reference: US-17, FR-AI-01
-- Purpose: Track inactivity reminders to prevent duplicate notifications

CREATE TABLE reminder_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    reminder_type VARCHAR(50) NOT NULL, -- INACTIVITY, WORKOUT_STREAK, etc.
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reminder_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for efficient querying of recent reminders
CREATE INDEX idx_reminder_logs_user_sent ON reminder_logs(user_id, sent_at DESC);
CREATE INDEX idx_reminder_logs_type_sent ON reminder_logs(reminder_type, sent_at DESC);

-- Comments
COMMENT ON TABLE reminder_logs IS 'Tracks system-sent reminders to prevent duplicate notifications';
COMMENT ON COLUMN reminder_logs.reminder_type IS 'Type of reminder: INACTIVITY, WORKOUT_STREAK, etc.';
COMMENT ON COLUMN reminder_logs.sent_at IS 'Timestamp when reminder was sent';
