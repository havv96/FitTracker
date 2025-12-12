-- V4: Create workouts table for tracking workout sessions
-- Reference: DATABASE_DESIGN.md - Section 3.3

CREATE TABLE workouts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    workout_date DATE NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    notes TEXT,
    total_volume DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_workouts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Composite index for user's workout history queries
CREATE INDEX idx_workouts_user_date ON workouts(user_id, workout_date DESC);

-- Index for date range queries
CREATE INDEX idx_workouts_date ON workouts(workout_date);

-- Table comments
COMMENT ON TABLE workouts IS 'Workout sessions with timestamps and volume tracking';
COMMENT ON COLUMN workouts.total_volume IS 'Sum of (reps × weight) for all sets in kg';
COMMENT ON COLUMN workouts.workout_date IS 'Date of the workout (calendar date, not timestamp)';
COMMENT ON COLUMN workouts.start_time IS 'Actual start timestamp of workout session';
COMMENT ON COLUMN workouts.end_time IS 'Actual end timestamp when workout was finished';
