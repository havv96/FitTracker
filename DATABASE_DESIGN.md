# Database Design & ER Diagram: FitTrack Pro
**Project:** FitTrack Pro
**Database:** PostgreSQL 15+
**Version:** 1.0
**Date:** 10.12.2025

---

## Table of Contents
1. [Database Overview](#1-database-overview)
2. [Entity Relationship Diagram](#2-entity-relationship-diagram)
3. [Table Specifications](#3-table-specifications)
4. [Relationships](#4-relationships)
5. [Indexes](#5-indexes)
6. [Constraints](#6-constraints)
7. [Migration Scripts](#7-migration-scripts)
8. [Sample Data](#8-sample-data)

---

## 1. Database Overview

### Database Configuration
- **Database Name:** `fittrack`
- **Character Set:** UTF-8
- **Collation:** en_US.UTF-8
- **Timezone:** UTC

### Design Principles
1. **Normalization:** Database follows 3NF (Third Normal Form)
2. **Foreign Keys:** All relationships enforced with FK constraints
3. **Soft Deletes:** No soft deletes - use CASCADE for referential integrity
4. **Timestamps:** All tables include `created_at` and `updated_at` where applicable
5. **Indexing Strategy:** Indexes on foreign keys and frequently queried columns

### Schema Structure
```
fittrack/
├── users                    # User accounts
├── user_profiles           # User physical data and goals
├── exercises               # Exercise catalog
├── routines                # Workout templates/plans
├── routine_exercises       # Exercises in routines
├── workouts                # Workout sessions
├── workout_sets            # Individual sets logged
├── food_items              # Food database
├── nutrition_logs          # Daily food intake
├── daily_stats             # Daily metrics (water, sleep, weight)
├── progress_photos         # Progress gallery
├── supplements             # User supplement list
├── supplement_logs         # Daily supplement tracking
└── notifications           # System notifications/reminders
```

---

## 2. Entity Relationship Diagram

### Visual Representation (ASCII)

```
┌─────────────────┐
│     users       │
│─────────────────│
│ PK id           │
│    email        │
│    password_hash│
│    role         │
│    created_at   │
│    updated_at   │
└────────┬────────┘
         │ 1
         │
         │ 1
┌────────┴────────────────┐
│    user_profiles        │
│─────────────────────────│
│ PK id                   │
│ FK user_id (UNIQUE)     │
│    height_cm            │
│    date_of_birth        │
│    gender               │
│    activity_level       │
│    weight_goal          │
│    target_weight_kg     │
│    created_at           │
│    updated_at           │
└─────────────────────────┘


         │ 1
         │
         │ *
┌────────┴────────┐        ┌─────────────────┐
│    workouts     │        │   exercises     │
│─────────────────│        │─────────────────│
│ PK id           │        │ PK id           │
│ FK user_id      │        │    name         │
│    workout_date │        │    muscle_group │
│    start_time   │        │    equipment_type│
│    end_time     │        │    description  │
│    notes        │        │    created_at   │
│    total_volume │        └────────┬────────┘
│    created_at   │                 │
└────────┬────────┘                 │
         │ 1                        │
         │                          │
         │ *                        │ *
┌────────┴────────┐                 │
│  workout_sets   │                 │
│─────────────────│                 │
│ PK id           │                 │
│ FK workout_id   │◄────────────────┘
│ FK exercise_id  │
│    set_number   │
│    reps         │
│    weight_kg    │
│    rpe          │
│    completed_at │
└─────────────────┘


┌─────────────────┐
│    routines     │
│─────────────────│
│ PK id           │
│ FK user_id      │
│    name         │
│    description  │
│    created_at   │
└────────┬────────┘
         │ 1
         │
         │ *
┌────────┴─────────────┐
│  routine_exercises   │
│──────────────────────│
│ PK id                │
│ FK routine_id        │
│ FK exercise_id       │
│    order_index       │
│    target_sets       │
│    target_reps       │
│    notes             │
└──────────────────────┘


         │ 1 (from users)
         │
         │ *
┌────────┴────────┐        ┌─────────────────┐
│ nutrition_logs  │        │   food_items    │
│─────────────────│        │─────────────────│
│ PK id           │        │ PK id           │
│ FK user_id      │        │    name         │
│ FK food_item_id │◄───────│    calories     │
│    log_date     │        │    protein_g    │
│    meal_type    │        │    carbs_g      │
│    quantity_g   │        │    fat_g        │
│    logged_at    │        │    serving_size │
└─────────────────┘        │    brand        │
                           │    created_at   │
                           └─────────────────┘


         │ 1 (from users)
         │
         │ *
┌────────┴────────┐
│  daily_stats    │
│─────────────────│
│ PK id           │
│ FK user_id      │
│    stat_date    │ (UNIQUE with user_id)
│    water_ml     │
│    sleep_hours  │
│    weight_kg    │
│    created_at   │
│    updated_at   │
└─────────────────┘


         │ 1 (from users)
         │
         │ *
┌────────┴────────────┐
│  progress_photos    │
│─────────────────────│
│ PK id               │
│ FK user_id          │
│    photo_url        │
│    photo_date       │
│    weight_kg        │
│    notes            │
│    created_at       │
└─────────────────────┘


         │ 1 (from users)
         │
         │ *
┌────────┴────────┐
│  supplements    │
│─────────────────│
│ PK id           │
│ FK user_id      │
│    name         │
│    dosage       │
│    time_of_day  │
│    is_active    │
│    created_at   │
└────────┬────────┘
         │ 1
         │
         │ *
┌────────┴─────────────┐
│  supplement_logs     │
│──────────────────────│
│ PK id                │
│ FK supplement_id     │
│    log_date          │
│    is_taken          │
│    logged_at         │
└──────────────────────┘


         │ 1 (from users)
         │
         │ *
┌────────┴────────────┐
│  notifications      │
│─────────────────────│
│ PK id               │
│ FK user_id          │
│    type             │
│    title            │
│    message          │
│    is_read          │
│    created_at       │
└─────────────────────┘
```

---

## 3. Table Specifications

### 3.1 users
**Description:** Stores user account credentials and authentication data.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | NO | AUTO | Primary key |
| email | VARCHAR(255) | NO | - | Unique user email |
| password_hash | VARCHAR(255) | NO | - | BCrypt hashed password |
| role | VARCHAR(50) | NO | 'USER' | User role (USER, ADMIN) |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Last update time |

**Constraints:**
- PRIMARY KEY: `id`
- UNIQUE: `email`
- CHECK: `email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'`

---

### 3.2 user_profiles
**Description:** Stores user's physical data, goals, and preferences.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | NO | AUTO | Primary key |
| user_id | BIGINT | NO | - | Foreign key to users |
| height_cm | DECIMAL(5,2) | YES | - | Height in centimeters |
| date_of_birth | DATE | YES | - | Date of birth |
| gender | VARCHAR(10) | YES | - | MALE, FEMALE |
| activity_level | VARCHAR(50) | YES | - | Activity level enum |
| weight_goal | VARCHAR(50) | YES | - | Weight goal enum |
| target_weight_kg | DECIMAL(5,2) | YES | - | Target weight in kg |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Profile creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Last update time |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id` REFERENCES `users(id)` ON DELETE CASCADE
- UNIQUE: `user_id`
- CHECK: `height_cm > 0`
- CHECK: `target_weight_kg > 0`
- CHECK: `gender IN ('MALE', 'FEMALE')`
- CHECK: `activity_level IN ('SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTRA_ACTIVE')`
- CHECK: `weight_goal IN ('LOSE_SLOW', 'LOSE_MODERATE', 'LOSE_FAST', 'MAINTAIN', 'GAIN_SLOW', 'GAIN_MODERATE')`

---

### 3.3 exercises
**Description:** Catalog of all available exercises.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | NO | AUTO | Primary key |
| name | VARCHAR(255) | NO | - | Exercise name |
| muscle_group | VARCHAR(100) | NO | - | Primary muscle group |
| equipment_type | VARCHAR(100) | YES | - | Equipment needed |
| description | TEXT | YES | - | Exercise description |
| instructions | TEXT | YES | - | How to perform |
| video_url | VARCHAR(500) | YES | - | Demo video URL |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Creation time |

**Constraints:**
- PRIMARY KEY: `id`
- CHECK: `muscle_group IN ('CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE', 'CARDIO')`
- CHECK: `equipment_type IN ('BARBELL', 'DUMBBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT', 'KETTLEBELL', 'BANDS')`

---

### 3.4 routines
**Description:** Workout templates/plans created by users.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | NO | AUTO | Primary key |
| user_id | BIGINT | NO | - | Foreign key to users |
| name | VARCHAR(255) | NO | - | Routine name (e.g., "Push Day") |
| description | TEXT | YES | - | Routine description |
| is_active | BOOLEAN | NO | TRUE | Is routine active |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Last update time |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id` REFERENCES `users(id)` ON DELETE CASCADE

---

### 3.5 routine_exercises
**Description:** Junction table linking exercises to routines.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | NO | AUTO | Primary key |
| routine_id | BIGINT | NO | - | Foreign key to routines |
| exercise_id | BIGINT | NO | - | Foreign key to exercises |
| order_index | INT | NO | - | Order in routine |
| target_sets | INT | YES | - | Planned sets |
| target_reps | INT | YES | - | Planned reps |
| notes | TEXT | YES | - | Exercise notes |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `routine_id` REFERENCES `routines(id)` ON DELETE CASCADE
- FOREIGN KEY: `exercise_id` REFERENCES `exercises(id)` ON DELETE CASCADE
- CHECK: `order_index >= 0`
- CHECK: `target_sets > 0`
- CHECK: `target_reps > 0`

---

### 3.6 workouts
**Description:** Individual workout sessions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | NO | AUTO | Primary key |
| user_id | BIGINT | NO | - | Foreign key to users |
| routine_id | BIGINT | YES | - | Foreign key to routines (optional) |
| workout_date | DATE | NO | - | Date of workout |
| start_time | TIMESTAMP | YES | - | Start timestamp |
| end_time | TIMESTAMP | YES | - | End timestamp |
| notes | TEXT | YES | - | Workout notes |
| total_volume | DECIMAL(10,2) | YES | 0 | Total volume (kg) |
| status | VARCHAR(20) | NO | 'IN_PROGRESS' | IN_PROGRESS, COMPLETED |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Creation time |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id` REFERENCES `users(id)` ON DELETE CASCADE
- FOREIGN KEY: `routine_id` REFERENCES `routines(id)` ON DELETE SET NULL
- CHECK: `end_time IS NULL OR end_time >= start_time`
- CHECK: `total_volume >= 0`
- CHECK: `status IN ('IN_PROGRESS', 'COMPLETED')`

---

### 3.7 workout_sets
**Description:** Individual sets performed during workouts.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | NO | AUTO | Primary key |
| workout_id | BIGINT | NO | - | Foreign key to workouts |
| exercise_id | BIGINT | NO | - | Foreign key to exercises |
| set_number | INT | NO | - | Set number (1, 2, 3...) |
| reps | INT | NO | - | Repetitions completed |
| weight_kg | DECIMAL(5,2) | NO | - | Weight used (kg) |
| rpe | INT | YES | - | Rate of Perceived Exertion (1-10) |
| completed_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Completion time |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `workout_id` REFERENCES `workouts(id)` ON DELETE CASCADE
- FOREIGN KEY: `exercise_id` REFERENCES `exercises(id)` ON DELETE CASCADE
- CHECK: `set_number > 0`
- CHECK: `reps > 0`
- CHECK: `weight_kg >= 0`
- CHECK: `rpe IS NULL OR (rpe >= 1 AND rpe <= 10)`

---

### 3.8 food_items
**Description:** Database of food items with nutritional information.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | NO | AUTO | Primary key |
| name | VARCHAR(255) | NO | - | Food name |
| calories | DECIMAL(7,2) | NO | - | Calories per 100g |
| protein_g | DECIMAL(6,2) | NO | - | Protein grams per 100g |
| carbs_g | DECIMAL(6,2) | NO | - | Carbs grams per 100g |
| fat_g | DECIMAL(6,2) | NO | - | Fat grams per 100g |
| serving_size | VARCHAR(100) | YES | - | Serving size description |
| brand | VARCHAR(255) | YES | - | Brand name (if applicable) |
| barcode | VARCHAR(50) | YES | - | Product barcode |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Creation time |

**Constraints:**
- PRIMARY KEY: `id`
- CHECK: `calories >= 0`
- CHECK: `protein_g >= 0`
- CHECK: `carbs_g >= 0`
- CHECK: `fat_g >= 0`

---

### 3.9 nutrition_logs
**Description:** Daily food intake logs.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | NO | AUTO | Primary key |
| user_id | BIGINT | NO | - | Foreign key to users |
| food_item_id | BIGINT | NO | - | Foreign key to food_items |
| log_date | DATE | NO | - | Date of consumption |
| meal_type | VARCHAR(50) | NO | - | BREAKFAST, LUNCH, DINNER, SNACK |
| quantity_g | DECIMAL(7,2) | NO | - | Quantity in grams |
| logged_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Log timestamp |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id` REFERENCES `users(id)` ON DELETE CASCADE
- FOREIGN KEY: `food_item_id` REFERENCES `food_items(id)` ON DELETE CASCADE
- CHECK: `meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK')`
- CHECK: `quantity_g > 0`

---

### 3.10 daily_stats
**Description:** Daily health metrics (water, sleep, weight).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | NO | AUTO | Primary key |
| user_id | BIGINT | NO | - | Foreign key to users |
| stat_date | DATE | NO | - | Date of stats |
| water_ml | INT | YES | 0 | Water intake (ml) |
| sleep_hours | DECIMAL(3,1) | YES | - | Sleep duration |
| sleep_quality | VARCHAR(20) | YES | - | POOR, FAIR, GOOD, EXCELLENT |
| weight_kg | DECIMAL(5,2) | YES | - | Body weight (kg) |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Last update time |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id` REFERENCES `users(id)` ON DELETE CASCADE
- UNIQUE: `(user_id, stat_date)`
- CHECK: `water_ml >= 0`
- CHECK: `sleep_hours IS NULL OR (sleep_hours >= 0 AND sleep_hours <= 24)`
- CHECK: `sleep_quality IS NULL OR sleep_quality IN ('POOR', 'FAIR', 'GOOD', 'EXCELLENT')`
- CHECK: `weight_kg IS NULL OR weight_kg > 0`

---

### 3.11 progress_photos
**Description:** User progress photos with metadata.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | NO | AUTO | Primary key |
| user_id | BIGINT | NO | - | Foreign key to users |
| photo_url | VARCHAR(500) | NO | - | Photo storage URL |
| photo_date | DATE | NO | - | Date photo was taken |
| weight_kg | DECIMAL(5,2) | YES | - | Weight at photo time |
| notes | TEXT | YES | - | Photo notes |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Upload time |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id` REFERENCES `users(id)` ON DELETE CASCADE
- CHECK: `weight_kg IS NULL OR weight_kg > 0`

---

### 3.12 supplements
**Description:** User's supplement list.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | NO | AUTO | Primary key |
| user_id | BIGINT | NO | - | Foreign key to users |
| name | VARCHAR(255) | NO | - | Supplement name |
| dosage | VARCHAR(100) | YES | - | Dosage (e.g., "5g") |
| time_of_day | VARCHAR(50) | YES | - | When to take |
| is_active | BOOLEAN | NO | TRUE | Is actively taking |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Creation time |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id` REFERENCES `users(id)` ON DELETE CASCADE

---

### 3.13 supplement_logs
**Description:** Daily supplement intake tracking.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | NO | AUTO | Primary key |
| supplement_id | BIGINT | NO | - | Foreign key to supplements |
| log_date | DATE | NO | - | Date taken |
| is_taken | BOOLEAN | NO | FALSE | Was it taken |
| logged_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Log time |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `supplement_id` REFERENCES `supplements(id)` ON DELETE CASCADE
- UNIQUE: `(supplement_id, log_date)`

---

### 3.14 notifications
**Description:** System notifications and reminders.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | NO | AUTO | Primary key |
| user_id | BIGINT | NO | - | Foreign key to users |
| type | VARCHAR(50) | NO | - | Notification type |
| title | VARCHAR(255) | NO | - | Notification title |
| message | TEXT | NO | - | Notification message |
| is_read | BOOLEAN | NO | FALSE | Read status |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Creation time |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id` REFERENCES `users(id)` ON DELETE CASCADE
- CHECK: `type IN ('INACTIVITY', 'PROGRESSIVE_OVERLOAD', 'GOAL_ACHIEVED', 'REMINDER', 'SYSTEM')`

---

## 4. Relationships

### One-to-One (1:1)
1. **users ↔ user_profiles**
   - One user has exactly one profile
   - Enforced by UNIQUE constraint on `user_profiles.user_id`

### One-to-Many (1:N)
1. **users → workouts**
   - One user can have many workouts

2. **users → routines**
   - One user can create many routines

3. **users → nutrition_logs**
   - One user can have many nutrition logs

4. **users → daily_stats**
   - One user can have many daily stat records

5. **users → progress_photos**
   - One user can upload many photos

6. **users → supplements**
   - One user can have many supplements

7. **users → notifications**
   - One user can receive many notifications

8. **workouts → workout_sets**
   - One workout contains many sets

9. **exercises → workout_sets**
   - One exercise can appear in many sets

10. **routines → routine_exercises**
    - One routine contains many exercises

11. **supplements → supplement_logs**
    - One supplement can have many log entries

12. **food_items → nutrition_logs**
    - One food item can be logged many times

### Many-to-Many (M:N) - via Junction Tables
1. **routines ↔ exercises** (via `routine_exercises`)
   - Many routines can include many exercises

2. **workouts ↔ exercises** (via `workout_sets`)
   - Many workouts can include many exercises

---

## 5. Indexes

### Primary Key Indexes (Automatic)
All tables have a PRIMARY KEY index on `id`.

### Foreign Key Indexes
```sql
-- user_profiles
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- workouts
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_routine_id ON workouts(routine_id);
CREATE INDEX idx_workouts_user_date ON workouts(user_id, workout_date DESC);

-- workout_sets
CREATE INDEX idx_workout_sets_workout_id ON workout_sets(workout_id);
CREATE INDEX idx_workout_sets_exercise_id ON workout_sets(exercise_id);

-- routine_exercises
CREATE INDEX idx_routine_exercises_routine_id ON routine_exercises(routine_id);
CREATE INDEX idx_routine_exercises_exercise_id ON routine_exercises(exercise_id);

-- nutrition_logs
CREATE INDEX idx_nutrition_logs_user_id ON nutrition_logs(user_id);
CREATE INDEX idx_nutrition_logs_food_id ON nutrition_logs(food_item_id);
CREATE INDEX idx_nutrition_logs_user_date ON nutrition_logs(user_id, log_date);

-- daily_stats
CREATE INDEX idx_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX idx_daily_stats_user_date ON daily_stats(user_id, stat_date DESC);

-- progress_photos
CREATE INDEX idx_progress_photos_user_id ON progress_photos(user_id);
CREATE INDEX idx_progress_photos_user_date ON progress_photos(user_id, photo_date DESC);

-- supplements
CREATE INDEX idx_supplements_user_id ON supplements(user_id);

-- supplement_logs
CREATE INDEX idx_supplement_logs_supplement_id ON supplement_logs(supplement_id);

-- notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
```

### Search/Filter Indexes
```sql
-- exercises
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX idx_exercises_equipment ON exercises(equipment_type);
CREATE INDEX idx_exercises_name ON exercises(name);

-- food_items
CREATE INDEX idx_food_items_name ON food_items(name);
CREATE INDEX idx_food_items_brand ON food_items(brand);

-- users
CREATE INDEX idx_users_email ON users(email);
```

### Performance Indexes
```sql
-- Full-text search on exercise names
CREATE INDEX idx_exercises_name_gin ON exercises USING gin(to_tsvector('english', name));

-- Full-text search on food names
CREATE INDEX idx_food_items_name_gin ON food_items USING gin(to_tsvector('english', name));
```

---

## 6. Constraints

### Data Integrity Constraints

#### Email Format Validation
```sql
ALTER TABLE users ADD CONSTRAINT chk_email_format
CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');
```

#### Positive Values
```sql
-- Weights must be positive
ALTER TABLE user_profiles ADD CONSTRAINT chk_target_weight_positive
CHECK (target_weight_kg > 0);

ALTER TABLE workout_sets ADD CONSTRAINT chk_weight_non_negative
CHECK (weight_kg >= 0);

ALTER TABLE daily_stats ADD CONSTRAINT chk_weight_positive
CHECK (weight_kg IS NULL OR weight_kg > 0);

-- Quantities must be positive
ALTER TABLE nutrition_logs ADD CONSTRAINT chk_quantity_positive
CHECK (quantity_g > 0);

-- Heights must be positive
ALTER TABLE user_profiles ADD CONSTRAINT chk_height_positive
CHECK (height_cm > 0);
```

#### RPE Range
```sql
ALTER TABLE workout_sets ADD CONSTRAINT chk_rpe_range
CHECK (rpe IS NULL OR (rpe >= 1 AND rpe <= 10));
```

#### Time Logic
```sql
ALTER TABLE workouts ADD CONSTRAINT chk_workout_times
CHECK (end_time IS NULL OR end_time >= start_time);

ALTER TABLE daily_stats ADD CONSTRAINT chk_sleep_hours
CHECK (sleep_hours IS NULL OR (sleep_hours >= 0 AND sleep_hours <= 24));
```

#### Enum Validations
```sql
-- Gender
ALTER TABLE user_profiles ADD CONSTRAINT chk_gender
CHECK (gender IN ('MALE', 'FEMALE'));

-- Activity Level
ALTER TABLE user_profiles ADD CONSTRAINT chk_activity_level
CHECK (activity_level IN ('SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTRA_ACTIVE'));

-- Weight Goal
ALTER TABLE user_profiles ADD CONSTRAINT chk_weight_goal
CHECK (weight_goal IN ('LOSE_SLOW', 'LOSE_MODERATE', 'LOSE_FAST', 'MAINTAIN', 'GAIN_SLOW', 'GAIN_MODERATE'));

-- Meal Type
ALTER TABLE nutrition_logs ADD CONSTRAINT chk_meal_type
CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'));

-- Workout Status
ALTER TABLE workouts ADD CONSTRAINT chk_workout_status
CHECK (status IN ('IN_PROGRESS', 'COMPLETED'));

-- Sleep Quality
ALTER TABLE daily_stats ADD CONSTRAINT chk_sleep_quality
CHECK (sleep_quality IS NULL OR sleep_quality IN ('POOR', 'FAIR', 'GOOD', 'EXCELLENT'));

-- Notification Type
ALTER TABLE notifications ADD CONSTRAINT chk_notification_type
CHECK (type IN ('INACTIVITY', 'PROGRESSIVE_OVERLOAD', 'GOAL_ACHIEVED', 'REMINDER', 'SYSTEM'));

-- Muscle Group
ALTER TABLE exercises ADD CONSTRAINT chk_muscle_group
CHECK (muscle_group IN ('CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE', 'CARDIO'));

-- Equipment Type
ALTER TABLE exercises ADD CONSTRAINT chk_equipment_type
CHECK (equipment_type IN ('BARBELL', 'DUMBBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT', 'KETTLEBELL', 'BANDS'));
```

---

## 7. Migration Scripts

### V1__create_users_table.sql
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
```

### V2__create_user_profiles_table.sql
```sql
CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    height_cm DECIMAL(5,2),
    date_of_birth DATE,
    gender VARCHAR(10),
    activity_level VARCHAR(50),
    weight_goal VARCHAR(50),
    target_weight_kg DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_height_positive CHECK (height_cm > 0),
    CONSTRAINT chk_target_weight_positive CHECK (target_weight_kg > 0),
    CONSTRAINT chk_gender CHECK (gender IN ('MALE', 'FEMALE')),
    CONSTRAINT chk_activity_level CHECK (activity_level IN ('SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTRA_ACTIVE')),
    CONSTRAINT chk_weight_goal CHECK (weight_goal IN ('LOSE_SLOW', 'LOSE_MODERATE', 'LOSE_FAST', 'MAINTAIN', 'GAIN_SLOW', 'GAIN_MODERATE'))
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

### V3__create_exercises_table.sql
```sql
CREATE TABLE exercises (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    muscle_group VARCHAR(100) NOT NULL,
    equipment_type VARCHAR(100),
    description TEXT,
    instructions TEXT,
    video_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_muscle_group CHECK (muscle_group IN ('CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE', 'CARDIO')),
    CONSTRAINT chk_equipment_type CHECK (equipment_type IN ('BARBELL', 'DUMBBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT', 'KETTLEBELL', 'BANDS'))
);

CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX idx_exercises_equipment ON exercises(equipment_type);
CREATE INDEX idx_exercises_name ON exercises(name);

-- Seed initial exercises
INSERT INTO exercises (name, muscle_group, equipment_type, description) VALUES
('Bench Press', 'CHEST', 'BARBELL', 'Compound pressing movement targeting chest, shoulders, and triceps'),
('Incline Bench Press', 'CHEST', 'BARBELL', 'Incline variation emphasizing upper chest'),
('Squat', 'LEGS', 'BARBELL', 'Compound lower body movement'),
('Deadlift', 'BACK', 'BARBELL', 'Full body pulling movement'),
('Overhead Press', 'SHOULDERS', 'BARBELL', 'Vertical pressing movement for shoulders'),
('Pull-up', 'BACK', 'BODYWEIGHT', 'Vertical pulling movement'),
('Dip', 'CHEST', 'BODYWEIGHT', 'Bodyweight pressing movement for chest and triceps'),
('Romanian Deadlift', 'LEGS', 'BARBELL', 'Hip hinge movement targeting hamstrings'),
('Bicep Curl', 'ARMS', 'DUMBBELL', 'Isolation exercise for biceps'),
('Tricep Dip', 'ARMS', 'BODYWEIGHT', 'Bodyweight exercise for triceps'),
('Lat Pulldown', 'BACK', 'CABLE', 'Vertical pulling movement on cable machine'),
('Leg Press', 'LEGS', 'MACHINE', 'Compound lower body pressing movement'),
('Plank', 'CORE', 'BODYWEIGHT', 'Static core exercise'),
('Cable Fly', 'CHEST', 'CABLE', 'Isolation exercise for chest'),
('Face Pull', 'SHOULDERS', 'CABLE', 'Rear delt and upper back exercise');
```

### V4__create_routines_tables.sql
```sql
CREATE TABLE routines (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_routines_user_id ON routines(user_id);

CREATE TABLE routine_exercises (
    id BIGSERIAL PRIMARY KEY,
    routine_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    order_index INT NOT NULL,
    target_sets INT,
    target_reps INT,
    notes TEXT,
    FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    CONSTRAINT chk_order_index CHECK (order_index >= 0),
    CONSTRAINT chk_target_sets CHECK (target_sets > 0),
    CONSTRAINT chk_target_reps CHECK (target_reps > 0)
);

CREATE INDEX idx_routine_exercises_routine_id ON routine_exercises(routine_id);
CREATE INDEX idx_routine_exercises_exercise_id ON routine_exercises(exercise_id);
```

### V5__create_workouts_tables.sql
```sql
CREATE TABLE workouts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    routine_id BIGINT,
    workout_date DATE NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    notes TEXT,
    total_volume DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE SET NULL,
    CONSTRAINT chk_workout_times CHECK (end_time IS NULL OR end_time >= start_time),
    CONSTRAINT chk_total_volume CHECK (total_volume >= 0),
    CONSTRAINT chk_workout_status CHECK (status IN ('IN_PROGRESS', 'COMPLETED'))
);

CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_routine_id ON workouts(routine_id);
CREATE INDEX idx_workouts_user_date ON workouts(user_id, workout_date DESC);

CREATE TABLE workout_sets (
    id BIGSERIAL PRIMARY KEY,
    workout_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    set_number INT NOT NULL,
    reps INT NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL,
    rpe INT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    CONSTRAINT chk_set_number CHECK (set_number > 0),
    CONSTRAINT chk_reps CHECK (reps > 0),
    CONSTRAINT chk_weight_non_negative CHECK (weight_kg >= 0),
    CONSTRAINT chk_rpe_range CHECK (rpe IS NULL OR (rpe >= 1 AND rpe <= 10))
);

CREATE INDEX idx_workout_sets_workout_id ON workout_sets(workout_id);
CREATE INDEX idx_workout_sets_exercise_id ON workout_sets(exercise_id);
```

### V6__create_food_items_table.sql
```sql
CREATE TABLE food_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    calories DECIMAL(7,2) NOT NULL,
    protein_g DECIMAL(6,2) NOT NULL,
    carbs_g DECIMAL(6,2) NOT NULL,
    fat_g DECIMAL(6,2) NOT NULL,
    serving_size VARCHAR(100),
    brand VARCHAR(255),
    barcode VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_calories CHECK (calories >= 0),
    CONSTRAINT chk_protein CHECK (protein_g >= 0),
    CONSTRAINT chk_carbs CHECK (carbs_g >= 0),
    CONSTRAINT chk_fat CHECK (fat_g >= 0)
);

CREATE INDEX idx_food_items_name ON food_items(name);
CREATE INDEX idx_food_items_brand ON food_items(brand);

-- Seed common foods
INSERT INTO food_items (name, calories, protein_g, carbs_g, fat_g, serving_size) VALUES
('Chicken Breast (Grilled)', 165, 31.0, 0.0, 3.6, '100g'),
('Chicken Thigh (Skinless)', 209, 26.0, 0.0, 10.9, '100g'),
('Brown Rice (Cooked)', 111, 2.6, 23.0, 0.9, '100g'),
('White Rice (Cooked)', 130, 2.7, 28.2, 0.3, '100g'),
('Egg (Whole)', 155, 13.0, 1.1, 11.0, '100g'),
('Egg White', 52, 11.0, 0.7, 0.2, '100g'),
('Banana', 89, 1.1, 23.0, 0.3, '100g'),
('Apple', 52, 0.3, 14.0, 0.2, '100g'),
('Oats (Dry)', 389, 16.9, 66.3, 6.9, '100g'),
('Greek Yogurt (Plain)', 59, 10.0, 3.6, 0.4, '100g'),
('Salmon (Cooked)', 206, 22.0, 0.0, 13.0, '100g'),
('Sweet Potato', 86, 1.6, 20.1, 0.1, '100g'),
('Broccoli', 34, 2.8, 7.0, 0.4, '100g'),
('Almonds', 579, 21.2, 21.6, 49.9, '100g'),
('Peanut Butter', 588, 25.1, 20.0, 50.0, '100g'),
('Whey Protein Powder', 411, 82.0, 8.0, 4.5, '100g'),
('Pasta (Cooked)', 131, 5.0, 25.1, 1.1, '100g'),
('Beef (Ground, Lean)', 250, 26.0, 0.0, 17.0, '100g'),
('Tuna (Canned in Water)', 116, 25.5, 0.0, 0.8, '100g'),
('Olive Oil', 884, 0.0, 0.0, 100.0, '100g');
```

### V7__create_nutrition_logs_table.sql
```sql
CREATE TABLE nutrition_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    food_item_id BIGINT NOT NULL,
    log_date DATE NOT NULL,
    meal_type VARCHAR(50) NOT NULL,
    quantity_g DECIMAL(7,2) NOT NULL,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE,
    CONSTRAINT chk_meal_type CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK')),
    CONSTRAINT chk_quantity_positive CHECK (quantity_g > 0)
);

CREATE INDEX idx_nutrition_logs_user_id ON nutrition_logs(user_id);
CREATE INDEX idx_nutrition_logs_food_id ON nutrition_logs(food_item_id);
CREATE INDEX idx_nutrition_logs_user_date ON nutrition_logs(user_id, log_date);
```

### V8__create_daily_stats_table.sql
```sql
CREATE TABLE daily_stats (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    stat_date DATE NOT NULL,
    water_ml INT DEFAULT 0,
    sleep_hours DECIMAL(3,1),
    sleep_quality VARCHAR(20),
    weight_kg DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, stat_date),
    CONSTRAINT chk_water CHECK (water_ml >= 0),
    CONSTRAINT chk_sleep_hours CHECK (sleep_hours IS NULL OR (sleep_hours >= 0 AND sleep_hours <= 24)),
    CONSTRAINT chk_sleep_quality CHECK (sleep_quality IS NULL OR sleep_quality IN ('POOR', 'FAIR', 'GOOD', 'EXCELLENT')),
    CONSTRAINT chk_weight_positive CHECK (weight_kg IS NULL OR weight_kg > 0)
);

CREATE INDEX idx_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX idx_daily_stats_user_date ON daily_stats(user_id, stat_date DESC);
```

### V9__create_progress_photos_table.sql
```sql
CREATE TABLE progress_photos (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    photo_date DATE NOT NULL,
    weight_kg DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_weight_positive CHECK (weight_kg IS NULL OR weight_kg > 0)
);

CREATE INDEX idx_progress_photos_user_id ON progress_photos(user_id);
CREATE INDEX idx_progress_photos_user_date ON progress_photos(user_id, photo_date DESC);
```

### V10__create_supplements_tables.sql
```sql
CREATE TABLE supplements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    time_of_day VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_supplements_user_id ON supplements(user_id);

CREATE TABLE supplement_logs (
    id BIGSERIAL PRIMARY KEY,
    supplement_id BIGINT NOT NULL,
    log_date DATE NOT NULL,
    is_taken BOOLEAN DEFAULT FALSE,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplement_id) REFERENCES supplements(id) ON DELETE CASCADE,
    UNIQUE (supplement_id, log_date)
);

CREATE INDEX idx_supplement_logs_supplement_id ON supplement_logs(supplement_id);
```

### V11__create_notifications_table.sql
```sql
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_notification_type CHECK (type IN ('INACTIVITY', 'PROGRESSIVE_OVERLOAD', 'GOAL_ACHIEVED', 'REMINDER', 'SYSTEM'))
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
```

---

## 8. Sample Data

### Sample User Journey Data
```sql
-- User registration
INSERT INTO users (email, password_hash, role) VALUES
('john.doe@example.com', '$2a$12$hashed_password_here', 'USER');

-- User profile setup
INSERT INTO user_profiles (user_id, height_cm, date_of_birth, gender, activity_level, weight_goal, target_weight_kg) VALUES
(1, 180.0, '1990-05-15', 'MALE', 'MODERATELY_ACTIVE', 'LOSE_MODERATE', 75.0);

-- Create a routine
INSERT INTO routines (user_id, name, description) VALUES
(1, 'Push Day', 'Chest, shoulders, and triceps workout');

-- Add exercises to routine
INSERT INTO routine_exercises (routine_id, exercise_id, order_index, target_sets, target_reps) VALUES
(1, 1, 0, 3, 8),  -- Bench Press
(1, 2, 1, 3, 10), -- Incline Bench Press
(1, 5, 2, 3, 8);  -- Overhead Press

-- Start a workout
INSERT INTO workouts (user_id, routine_id, workout_date, start_time) VALUES
(1, 1, '2025-12-10', '2025-12-10 14:30:00');

-- Log workout sets
INSERT INTO workout_sets (workout_id, exercise_id, set_number, reps, weight_kg, rpe) VALUES
(1, 1, 1, 8, 80.0, 7),
(1, 1, 2, 8, 80.0, 8),
(1, 1, 3, 7, 80.0, 9);

-- Finish workout
UPDATE workouts SET end_time = '2025-12-10 15:45:00', total_volume = 1920.0, status = 'COMPLETED' WHERE id = 1;

-- Log nutrition
INSERT INTO nutrition_logs (user_id, food_item_id, log_date, meal_type, quantity_g) VALUES
(1, 1, '2025-12-10', 'LUNCH', 200.0),  -- Chicken Breast
(1, 3, '2025-12-10', 'LUNCH', 150.0);  -- Brown Rice

-- Log daily stats
INSERT INTO daily_stats (user_id, stat_date, water_ml, weight_kg) VALUES
(1, '2025-12-10', 2000, 82.5);

-- Add supplements
INSERT INTO supplements (user_id, name, dosage, time_of_day) VALUES
(1, 'Creatine', '5g', 'Morning'),
(1, 'Vitamin D', '2000 IU', 'Morning'),
(1, 'Omega-3', '1000mg', 'Dinner');
```

---

**End of Database Design Documentation**
