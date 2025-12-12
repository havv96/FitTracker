-- V5: Create workout_sets table for tracking individual sets
-- Reference: DATABASE_DESIGN.md - Section 3.4

CREATE TABLE workout_sets (
    id BIGSERIAL PRIMARY KEY,
    workout_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    set_number INT NOT NULL,
    reps INT NOT NULL CHECK (reps > 0),
    weight_kg DECIMAL(5,2) NOT NULL CHECK (weight_kg >= 0),
    rpe INT CHECK (rpe BETWEEN 1 AND 10),
    notes TEXT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_workout_sets_workout FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    CONSTRAINT fk_workout_sets_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

-- Indexes for efficient queries
CREATE INDEX idx_workout_sets_workout ON workout_sets(workout_id);
CREATE INDEX idx_workout_sets_exercise ON workout_sets(exercise_id);

-- Composite index for finding user's exercise history
CREATE INDEX idx_workout_sets_exercise_completed ON workout_sets(exercise_id, completed_at DESC);

-- Table comments
COMMENT ON TABLE workout_sets IS 'Individual sets within a workout with performance metrics';
COMMENT ON COLUMN workout_sets.set_number IS 'Sequential set number within the workout (1, 2, 3, etc.)';
COMMENT ON COLUMN workout_sets.reps IS 'Number of repetitions completed';
COMMENT ON COLUMN workout_sets.weight_kg IS 'Weight used in kilograms (0 for bodyweight exercises)';
COMMENT ON COLUMN workout_sets.rpe IS 'Rate of Perceived Exertion (1-10 scale, where 10 is maximum effort)';
COMMENT ON COLUMN workout_sets.completed_at IS 'Timestamp when the set was completed';
