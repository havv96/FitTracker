-- V10: Create body_metrics table
-- Stores body measurements and composition data for tracking physical progress

CREATE TABLE IF NOT EXISTS body_metrics (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    weight_kg DOUBLE PRECISION NOT NULL,
    body_fat_percentage DOUBLE PRECISION,
    muscle_mass_kg DOUBLE PRECISION,
    waist_cm DOUBLE PRECISION,
    chest_cm DOUBLE PRECISION,
    arms_cm DOUBLE PRECISION,
    legs_cm DOUBLE PRECISION,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_body_metrics_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_body_metrics_user_date
        UNIQUE (user_id, date),

    CONSTRAINT chk_body_metrics_weight
        CHECK (weight_kg > 0 AND weight_kg < 500),

    CONSTRAINT chk_body_metrics_body_fat
        CHECK (body_fat_percentage IS NULL OR (body_fat_percentage >= 0 AND body_fat_percentage <= 100)),

    CONSTRAINT chk_body_metrics_waist
        CHECK (waist_cm IS NULL OR waist_cm > 0),

    CONSTRAINT chk_body_metrics_chest
        CHECK (chest_cm IS NULL OR chest_cm > 0),

    CONSTRAINT chk_body_metrics_arms
        CHECK (arms_cm IS NULL OR arms_cm > 0),

    CONSTRAINT chk_body_metrics_legs
        CHECK (legs_cm IS NULL OR legs_cm > 0)
);

-- Indexes for better query performance
CREATE INDEX idx_body_metrics_user_date ON body_metrics(user_id, date DESC);
CREATE INDEX idx_body_metrics_date ON body_metrics(date);

-- Comments for documentation
COMMENT ON TABLE body_metrics IS 'Body measurements and composition tracking';
COMMENT ON COLUMN body_metrics.user_id IS 'Reference to user who owns this measurement';
COMMENT ON COLUMN body_metrics.date IS 'Date when measurement was taken';
COMMENT ON COLUMN body_metrics.weight_kg IS 'Body weight in kilograms';
COMMENT ON COLUMN body_metrics.body_fat_percentage IS 'Body fat percentage (0-100)';
COMMENT ON COLUMN body_metrics.muscle_mass_kg IS 'Muscle mass in kilograms';
COMMENT ON COLUMN body_metrics.waist_cm IS 'Waist circumference in centimeters';
COMMENT ON COLUMN body_metrics.chest_cm IS 'Chest circumference in centimeters';
COMMENT ON COLUMN body_metrics.arms_cm IS 'Arms circumference in centimeters';
COMMENT ON COLUMN body_metrics.legs_cm IS 'Legs circumference in centimeters';
COMMENT ON COLUMN body_metrics.notes IS 'Optional notes about measurement conditions';
