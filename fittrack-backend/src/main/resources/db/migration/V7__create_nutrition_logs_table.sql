-- V7: Create nutrition_logs table for daily food intake tracking
-- Reference: DATABASE_DESIGN.md - Section 4.2

CREATE TABLE nutrition_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    food_item_id BIGINT NOT NULL,
    log_date DATE NOT NULL,
    meal_type VARCHAR(50) NOT NULL,
    servings DECIMAL(8,2) NOT NULL CHECK (servings > 0),
    total_calories DECIMAL(8,2) NOT NULL,
    total_protein_g DECIMAL(8,2) NOT NULL,
    total_carbs_g DECIMAL(8,2) NOT NULL,
    total_fat_g DECIMAL(8,2) NOT NULL,
    notes TEXT,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_nutrition_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_nutrition_logs_food_item FOREIGN KEY (food_item_id) REFERENCES food_items(id),
    CONSTRAINT chk_meal_type CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'PRE_WORKOUT', 'POST_WORKOUT'))
);

-- Indexes for efficient queries
CREATE INDEX idx_nutrition_logs_user_date ON nutrition_logs(user_id, log_date DESC);
CREATE INDEX idx_nutrition_logs_date ON nutrition_logs(log_date);
CREATE INDEX idx_nutrition_logs_meal_type ON nutrition_logs(meal_type);
CREATE INDEX idx_nutrition_logs_food_item ON nutrition_logs(food_item_id);

-- Table comments
COMMENT ON TABLE nutrition_logs IS 'Daily food intake logs with calculated macros';
COMMENT ON COLUMN nutrition_logs.meal_type IS 'Type of meal: BREAKFAST, LUNCH, DINNER, SNACK, PRE_WORKOUT, POST_WORKOUT';
COMMENT ON COLUMN nutrition_logs.servings IS 'Number of servings consumed (can be fractional, e.g., 1.5)';
COMMENT ON COLUMN nutrition_logs.total_calories IS 'Calculated: servings × food_item.calories';
COMMENT ON COLUMN nutrition_logs.total_protein_g IS 'Calculated: servings × food_item.protein_g';
COMMENT ON COLUMN nutrition_logs.total_carbs_g IS 'Calculated: servings × food_item.carbs_g';
COMMENT ON COLUMN nutrition_logs.total_fat_g IS 'Calculated: servings × food_item.fat_g';
