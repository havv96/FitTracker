-- Create user_profiles table
CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    height_cm DECIMAL(5,2),
    date_of_birth DATE,
    gender VARCHAR(10),
    activity_level VARCHAR(50),
    weight_goal VARCHAR(50),
    target_weight_kg DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_height_positive CHECK (height_cm IS NULL OR height_cm > 0),
    CONSTRAINT chk_target_weight_positive CHECK (target_weight_kg IS NULL OR target_weight_kg > 0),
    CONSTRAINT chk_gender CHECK (gender IS NULL OR gender IN ('MALE', 'FEMALE')),
    CONSTRAINT chk_activity_level CHECK (activity_level IS NULL OR activity_level IN ('SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTRA_ACTIVE')),
    CONSTRAINT chk_weight_goal CHECK (weight_goal IS NULL OR weight_goal IN ('LOSE_SLOW', 'LOSE_MODERATE', 'LOSE_FAST', 'MAINTAIN', 'GAIN_SLOW', 'GAIN_MODERATE'))
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Add comments on table
COMMENT ON TABLE user_profiles IS 'Stores user physical data, goals, and preferences';
COMMENT ON COLUMN user_profiles.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN user_profiles.height_cm IS 'Height in centimeters';
COMMENT ON COLUMN user_profiles.date_of_birth IS 'Date of birth for age calculation';
COMMENT ON COLUMN user_profiles.gender IS 'Gender (MALE, FEMALE) for BMR calculation';
COMMENT ON COLUMN user_profiles.activity_level IS 'Activity level for TDEE calculation';
COMMENT ON COLUMN user_profiles.weight_goal IS 'Weight goal (LOSE/MAINTAIN/GAIN) with speed';
COMMENT ON COLUMN user_profiles.target_weight_kg IS 'Target body weight in kilograms';
