-- V6: Create food_items table for nutrition tracking
-- Reference: DATABASE_DESIGN.md - Section 4.1

CREATE TABLE food_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    serving_size DECIMAL(8,2) NOT NULL,
    serving_unit VARCHAR(50) NOT NULL,
    calories DECIMAL(8,2) NOT NULL CHECK (calories >= 0),
    protein_g DECIMAL(8,2) NOT NULL CHECK (protein_g >= 0),
    carbs_g DECIMAL(8,2) NOT NULL CHECK (carbs_g >= 0),
    fat_g DECIMAL(8,2) NOT NULL CHECK (fat_g >= 0),
    fiber_g DECIMAL(8,2) CHECK (fiber_g >= 0),
    sugar_g DECIMAL(8,2) CHECK (sugar_g >= 0),
    sodium_mg DECIMAL(8,2) CHECK (sodium_mg >= 0),
    barcode VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_food_items_name ON food_items(name);
CREATE INDEX idx_food_items_brand ON food_items(brand);
CREATE INDEX idx_food_items_barcode ON food_items(barcode);
CREATE INDEX idx_food_items_verified ON food_items(is_verified);

-- Table comments
COMMENT ON TABLE food_items IS 'Food database with nutritional information per serving';
COMMENT ON COLUMN food_items.serving_size IS 'Size of one serving (e.g., 100, 1, 0.5)';
COMMENT ON COLUMN food_items.serving_unit IS 'Unit of serving (g, ml, cup, piece, slice, etc.)';
COMMENT ON COLUMN food_items.calories IS 'Calories per serving (kcal)';
COMMENT ON COLUMN food_items.protein_g IS 'Protein in grams per serving';
COMMENT ON COLUMN food_items.carbs_g IS 'Carbohydrates in grams per serving';
COMMENT ON COLUMN food_items.fat_g IS 'Fat in grams per serving';
COMMENT ON COLUMN food_items.is_verified IS 'Admin-verified food item';

-- Seed data with common foods
INSERT INTO food_items (name, brand, serving_size, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, is_verified) VALUES
-- Proteins
('Chicken Breast', 'Generic', 100, 'g', 165, 31, 0, 3.6, 0, 0, 74, true),
('Salmon', 'Generic', 100, 'g', 208, 20, 0, 13, 0, 0, 59, true),
('Eggs', 'Generic', 1, 'large', 72, 6.3, 0.4, 4.8, 0, 0.2, 71, true),
('Greek Yogurt', 'Generic', 100, 'g', 59, 10, 3.6, 0.4, 0, 3.2, 36, true),
('Whey Protein', 'Generic', 30, 'g', 120, 24, 3, 1.5, 0, 1, 50, true),

-- Carbs
('Brown Rice', 'Generic', 100, 'g', 111, 2.6, 23, 0.9, 1.8, 0.4, 5, true),
('Oatmeal', 'Generic', 100, 'g', 389, 16.9, 66.3, 6.9, 10.6, 0, 2, true),
('Banana', 'Generic', 1, 'medium', 105, 1.3, 27, 0.4, 3.1, 14.4, 1, true),
('Sweet Potato', 'Generic', 100, 'g', 86, 1.6, 20, 0.1, 3, 4.2, 55, true),
('Whole Wheat Bread', 'Generic', 1, 'slice', 69, 3.6, 11.6, 0.9, 1.9, 1.4, 147, true),

-- Fats
('Almonds', 'Generic', 28, 'g', 164, 6, 6, 14, 3.5, 1.2, 0, true),
('Avocado', 'Generic', 100, 'g', 160, 2, 8.5, 14.7, 6.7, 0.7, 7, true),
('Olive Oil', 'Generic', 15, 'ml', 119, 0, 0, 13.5, 0, 0, 0, true),
('Peanut Butter', 'Generic', 32, 'g', 188, 7.7, 6.9, 16, 1.8, 2.8, 152, true),

-- Vegetables
('Broccoli', 'Generic', 100, 'g', 34, 2.8, 6.6, 0.4, 2.6, 1.7, 33, true),
('Spinach', 'Generic', 100, 'g', 23, 2.9, 3.6, 0.4, 2.2, 0.4, 79, true),

-- Beverages
('Whole Milk', 'Generic', 240, 'ml', 149, 7.7, 11.7, 7.9, 0, 12.3, 105, true),
('Orange Juice', 'Generic', 240, 'ml', 112, 1.7, 25.8, 0.5, 0.5, 20.8, 2, true),

-- Snacks
('Apple', 'Generic', 1, 'medium', 95, 0.5, 25, 0.3, 4.4, 19, 2, true),
('Protein Bar', 'Generic', 1, 'bar', 200, 20, 22, 6, 3, 12, 200, true);
