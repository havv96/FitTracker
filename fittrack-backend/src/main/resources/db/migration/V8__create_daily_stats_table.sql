-- V8: Create daily_stats table for daily metrics tracking
-- Reference: DATABASE_DESIGN.md - Section 4.3

CREATE TABLE daily_stats (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    stat_date DATE NOT NULL,
    water_ml INT DEFAULT 0 CHECK (water_ml >= 0),
    sleep_hours DECIMAL(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
    weight_kg DECIMAL(5,2) CHECK (weight_kg > 0),
    body_fat_percentage DECIMAL(4,2) CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_daily_stats_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_stat_date UNIQUE (user_id, stat_date)
);

-- Indexes for efficient queries
CREATE INDEX idx_daily_stats_user_date ON daily_stats(user_id, stat_date DESC);
CREATE INDEX idx_daily_stats_date ON daily_stats(stat_date);

-- Table comments
COMMENT ON TABLE daily_stats IS 'Daily health and fitness metrics per user';
COMMENT ON COLUMN daily_stats.water_ml IS 'Water intake in milliliters';
COMMENT ON COLUMN daily_stats.sleep_hours IS 'Hours of sleep (can include decimals for 30 min = 0.5)';
COMMENT ON COLUMN daily_stats.weight_kg IS 'Body weight in kilograms';
COMMENT ON COLUMN daily_stats.body_fat_percentage IS 'Body fat percentage if measured';
COMMENT ON CONSTRAINT uq_user_stat_date ON daily_stats IS 'One stats record per user per day';
