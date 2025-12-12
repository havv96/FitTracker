-- V3: Create exercises table for exercise catalog
-- Reference: DATABASE_DESIGN.md - Section 3.2

CREATE TABLE exercises (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    muscle_group VARCHAR(100) NOT NULL,
    equipment_type VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient filtering
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX idx_exercises_equipment ON exercises(equipment_type);

-- Table comment
COMMENT ON TABLE exercises IS 'Exercise catalog with muscle groups and equipment types';
COMMENT ON COLUMN exercises.muscle_group IS 'Primary muscle group: CHEST, BACK, LEGS, SHOULDERS, ARMS, CORE, CARDIO';
COMMENT ON COLUMN exercises.equipment_type IS 'Equipment required: BARBELL, DUMBBELL, MACHINE, CABLE, BODYWEIGHT, CARDIO';

-- Seed data with common exercises
INSERT INTO exercises (name, muscle_group, equipment_type, description) VALUES
('Bench Press', 'CHEST', 'BARBELL', 'Compound chest exercise with barbell'),
('Incline Dumbbell Press', 'CHEST', 'DUMBBELL', 'Upper chest development with dumbbells'),
('Push-ups', 'CHEST', 'BODYWEIGHT', 'Classic bodyweight chest exercise'),
('Squat', 'LEGS', 'BARBELL', 'Compound lower body exercise'),
('Leg Press', 'LEGS', 'MACHINE', 'Machine-based leg exercise'),
('Romanian Deadlift', 'LEGS', 'BARBELL', 'Hamstring-focused deadlift variation'),
('Deadlift', 'BACK', 'BARBELL', 'Full-body compound pulling exercise'),
('Pull-up', 'BACK', 'BODYWEIGHT', 'Vertical pulling bodyweight exercise'),
('Barbell Row', 'BACK', 'BARBELL', 'Horizontal pulling with barbell'),
('Lat Pulldown', 'BACK', 'CABLE', 'Lat development with cable machine'),
('Overhead Press', 'SHOULDERS', 'BARBELL', 'Shoulder press with barbell'),
('Lateral Raise', 'SHOULDERS', 'DUMBBELL', 'Isolation for lateral deltoids'),
('Bicep Curl', 'ARMS', 'DUMBBELL', 'Bicep isolation exercise'),
('Tricep Dip', 'ARMS', 'BODYWEIGHT', 'Compound tricep exercise'),
('Plank', 'CORE', 'BODYWEIGHT', 'Isometric core stability exercise');
