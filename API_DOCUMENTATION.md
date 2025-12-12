# API Documentation: FitTrack Pro
**Project:** FitTrack Pro
**Version:** 1.0
**Base URL:** `/api/v1`
**Date:** 10.12.2025

---

## Table of Contents
1. [Authentication & Authorization](#1-authentication--authorization)
2. [Authentication Endpoints](#2-authentication-endpoints)
3. [User Profile Endpoints](#3-user-profile-endpoints)
4. [Exercise Endpoints](#4-exercise-endpoints)
5. [Workout Endpoints](#5-workout-endpoints)
6. [Nutrition Endpoints](#6-nutrition-endpoints)
7. [Metrics & Dashboard Endpoints](#7-metrics--dashboard-endpoints)
8. [Error Responses](#8-error-responses)
9. [OpenAPI Specification](#9-openapi-specification)

---

## 1. Authentication & Authorization

### Authentication Method
FitTrack Pro uses **JWT (JSON Web Tokens)** for authentication.

### Token Types
- **Access Token:** Short-lived token (15 minutes) for API authentication
- **Refresh Token:** Long-lived token (7 days) for obtaining new access tokens

### Using Tokens
Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Token Refresh Flow
1. When access token expires (401 Unauthorized)
2. Use refresh token to get new access token via `/auth/refresh`
3. If refresh token is expired, user must log in again

---

## 2. Authentication Endpoints

### 2.1 Register New User

**Endpoint:** `POST /api/v1/auth/register`

**Description:** Creates a new user account with email and password.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Request Body Schema:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| email | string | Yes | Valid email format |
| password | string | Yes | Min 8 chars, 1 uppercase, 1 digit |

**Success Response (201 Created):**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "email": "user@example.com",
  "userId": 123
}
```

**Error Responses:**
```json
// 400 Bad Request - Invalid email format
{
  "timestamp": "2025-12-10T10:30:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid email format",
  "path": "/api/v1/auth/register"
}

// 409 Conflict - Email already exists
{
  "timestamp": "2025-12-10T10:30:00.000Z",
  "status": 409,
  "error": "Conflict",
  "message": "Email already in use",
  "path": "/api/v1/auth/register"
}

// 400 Bad Request - Weak password
{
  "timestamp": "2025-12-10T10:30:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Password must be at least 8 characters with 1 digit and 1 uppercase letter",
  "path": "/api/v1/auth/register"
}
```

---

### 2.2 User Login

**Endpoint:** `POST /api/v1/auth/login`

**Description:** Authenticates user and returns JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "email": "user@example.com",
  "userId": 123
}
```

**Error Responses:**
```json
// 401 Unauthorized - Invalid credentials
{
  "timestamp": "2025-12-10T10:30:00.000Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid email or password",
  "path": "/api/v1/auth/login"
}
```

---

### 2.3 Refresh Access Token

**Endpoint:** `POST /api/v1/auth/refresh`

**Description:** Generates a new access token using a valid refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "email": "user@example.com",
  "userId": 123
}
```

**Error Responses:**
```json
// 401 Unauthorized - Invalid or expired refresh token
{
  "timestamp": "2025-12-10T10:30:00.000Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or expired refresh token",
  "path": "/api/v1/auth/refresh"
}
```

---

## 3. User Profile Endpoints

### 3.1 Create or Update Profile

**Endpoint:** `POST /api/v1/profile`

**Description:** Creates or updates user's physical profile and calculates BMR/TDEE.

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "heightCm": 180.0,
  "dateOfBirth": "1990-05-15",
  "gender": "MALE",
  "activityLevel": "MODERATELY_ACTIVE",
  "weightGoal": "LOSE_MODERATE",
  "targetWeightKg": 75.0,
  "currentWeightKg": 85.0
}
```

**Request Body Schema:**
| Field | Type | Required | Valid Values |
|-------|------|----------|--------------|
| heightCm | decimal | Yes | > 0 |
| dateOfBirth | date | Yes | ISO 8601 format |
| gender | string | Yes | MALE, FEMALE |
| activityLevel | string | Yes | SEDENTARY, LIGHTLY_ACTIVE, MODERATELY_ACTIVE, VERY_ACTIVE, EXTRA_ACTIVE |
| weightGoal | string | Yes | LOSE_SLOW, LOSE_MODERATE, LOSE_FAST, MAINTAIN, GAIN_SLOW, GAIN_MODERATE |
| targetWeightKg | decimal | Yes | > 0 |
| currentWeightKg | decimal | Yes | > 0 |

**Success Response (200 OK):**
```json
{
  "profile": {
    "id": 45,
    "userId": 123,
    "heightCm": 180.0,
    "dateOfBirth": "1990-05-15",
    "gender": "MALE",
    "activityLevel": "MODERATELY_ACTIVE",
    "weightGoal": "LOSE_MODERATE",
    "targetWeightKg": 75.0,
    "createdAt": "2025-12-10T10:30:00.000Z",
    "updatedAt": "2025-12-10T10:30:00.000Z"
  },
  "calculations": {
    "bmr": 1850.5,
    "tdee": 2868.3,
    "recommendedCalories": 2368.3,
    "macroTargets": {
      "protein": 177.6,
      "carbs": 236.8,
      "fat": 78.9
    }
  }
}
```

**Calculation Formulas:**
- **BMR (Mifflin-St Jeor):**
  - Male: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
  - Female: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
- **TDEE:** BMR × Activity Multiplier
  - SEDENTARY: 1.2
  - LIGHTLY_ACTIVE: 1.375
  - MODERATELY_ACTIVE: 1.55
  - VERY_ACTIVE: 1.725
  - EXTRA_ACTIVE: 1.9
- **Recommended Calories:**
  - LOSE_SLOW: TDEE - 250 (0.25 kg/week)
  - LOSE_MODERATE: TDEE - 500 (0.5 kg/week)
  - LOSE_FAST: TDEE - 750 (0.75 kg/week)
  - MAINTAIN: TDEE
  - GAIN_SLOW: TDEE + 250
  - GAIN_MODERATE: TDEE + 500
- **Macro Split:**
  - Protein: 30% of calories (÷ 4 cal/g)
  - Carbs: 40% of calories (÷ 4 cal/g)
  - Fat: 30% of calories (÷ 9 cal/g)

---

### 3.2 Get User Profile

**Endpoint:** `GET /api/v1/profile`

**Description:** Retrieves current user's profile with calculated metrics.

**Authentication:** Required (Bearer Token)

**Success Response (200 OK):**
```json
{
  "profile": {
    "id": 45,
    "userId": 123,
    "heightCm": 180.0,
    "dateOfBirth": "1990-05-15",
    "gender": "MALE",
    "activityLevel": "MODERATELY_ACTIVE",
    "weightGoal": "LOSE_MODERATE",
    "targetWeightKg": 75.0,
    "createdAt": "2025-12-10T10:30:00.000Z",
    "updatedAt": "2025-12-10T10:30:00.000Z"
  },
  "calculations": {
    "bmr": 1850.5,
    "tdee": 2868.3,
    "recommendedCalories": 2368.3,
    "macroTargets": {
      "protein": 177.6,
      "carbs": 236.8,
      "fat": 78.9
    }
  }
}
```

**Error Responses:**
```json
// 404 Not Found - Profile not created yet
{
  "timestamp": "2025-12-10T10:30:00.000Z",
  "status": 404,
  "error": "Not Found",
  "message": "Profile not found for user",
  "path": "/api/v1/profile"
}
```

---

## 4. Exercise Endpoints

### 4.1 Get All Exercises (Paginated)

**Endpoint:** `GET /api/v1/exercises`

**Description:** Retrieves list of exercises with optional filtering and pagination.

**Authentication:** Required (Bearer Token)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 0) |
| size | integer | No | Page size (default: 20, max: 100) |
| muscleGroup | string | No | Filter by muscle group |
| equipmentType | string | No | Filter by equipment |
| search | string | No | Search by exercise name |

**Example Request:**
```
GET /api/v1/exercises?muscleGroup=CHEST&equipmentType=BARBELL&page=0&size=10
```

**Success Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Bench Press",
      "muscleGroup": "CHEST",
      "equipmentType": "BARBELL",
      "description": "Compound pressing movement targeting chest, shoulders, and triceps",
      "createdAt": "2025-12-10T10:30:00.000Z"
    },
    {
      "id": 5,
      "name": "Incline Bench Press",
      "muscleGroup": "CHEST",
      "equipmentType": "BARBELL",
      "description": "Incline variation emphasizing upper chest",
      "createdAt": "2025-12-10T10:30:00.000Z"
    }
  ],
  "page": {
    "size": 10,
    "number": 0,
    "totalElements": 2,
    "totalPages": 1
  }
}
```

**Valid Enum Values:**

**Muscle Groups:**
- CHEST
- BACK
- LEGS
- SHOULDERS
- ARMS
- CORE
- CARDIO

**Equipment Types:**
- BARBELL
- DUMBBELL
- MACHINE
- CABLE
- BODYWEIGHT
- KETTLEBELL
- BANDS

---

### 4.2 Get Exercise by ID

**Endpoint:** `GET /api/v1/exercises/{id}`

**Description:** Retrieves detailed information about a specific exercise.

**Authentication:** Required (Bearer Token)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Exercise ID |

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "Bench Press",
  "muscleGroup": "CHEST",
  "equipmentType": "BARBELL",
  "description": "Compound pressing movement targeting chest, shoulders, and triceps",
  "instructions": [
    "Lie on flat bench with feet planted on floor",
    "Grip bar slightly wider than shoulder width",
    "Lower bar to mid-chest with control",
    "Press bar back to starting position"
  ],
  "videoUrl": "https://example.com/videos/bench-press.mp4",
  "createdAt": "2025-12-10T10:30:00.000Z"
}
```

---

## 5. Workout Endpoints

### 5.1 Start Workout

**Endpoint:** `POST /api/v1/workouts`

**Description:** Creates a new workout session.

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "date": "2025-12-10",
  "notes": "Push Day - Feeling strong"
}
```

**Success Response (201 Created):**
```json
{
  "id": 456,
  "userId": 123,
  "workoutDate": "2025-12-10",
  "startTime": "2025-12-10T14:30:00.000Z",
  "endTime": null,
  "notes": "Push Day - Feeling strong",
  "totalVolume": 0,
  "status": "IN_PROGRESS",
  "createdAt": "2025-12-10T14:30:00.000Z"
}
```

---

### 5.2 Log Workout Set

**Endpoint:** `POST /api/v1/workouts/{workoutId}/sets`

**Description:** Adds a completed set to an active workout.

**Authentication:** Required (Bearer Token)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| workoutId | integer | Workout ID |

**Request Body:**
```json
{
  "exerciseId": 1,
  "setNumber": 1,
  "reps": 8,
  "weightKg": 80.0,
  "rpe": 7
}
```

**Request Body Schema:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| exerciseId | integer | Yes | Valid exercise ID |
| setNumber | integer | Yes | > 0 |
| reps | integer | Yes | > 0 |
| weightKg | decimal | Yes | ≥ 0 |
| rpe | integer | No | 1-10 (Rate of Perceived Exertion) |

**Success Response (201 Created):**
```json
{
  "id": 789,
  "workoutId": 456,
  "exercise": {
    "id": 1,
    "name": "Bench Press"
  },
  "setNumber": 1,
  "reps": 8,
  "weightKg": 80.0,
  "rpe": 7,
  "volumeLoad": 640.0,
  "completedAt": "2025-12-10T14:35:00.000Z"
}
```

**Volume Load Calculation:**
```
volumeLoad = reps × weightKg
Example: 8 reps × 80 kg = 640 kg
```

---

### 5.3 Get Previous Workout Data

**Endpoint:** `GET /api/v1/workouts/previous/{exerciseId}`

**Description:** Retrieves the last workout data for a specific exercise (for comparison).

**Authentication:** Required (Bearer Token)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| exerciseId | integer | Exercise ID |

**Success Response (200 OK):**
```json
{
  "exerciseId": 1,
  "exerciseName": "Bench Press",
  "lastWorkoutDate": "2025-12-08",
  "sets": [
    {
      "setNumber": 1,
      "reps": 8,
      "weightKg": 77.5,
      "rpe": 6,
      "volumeLoad": 620.0
    },
    {
      "setNumber": 2,
      "reps": 8,
      "weightKg": 77.5,
      "rpe": 7,
      "volumeLoad": 620.0
    },
    {
      "setNumber": 3,
      "reps": 7,
      "weightKg": 77.5,
      "rpe": 8,
      "volumeLoad": 542.5
    }
  ],
  "totalVolume": 1782.5
}
```

---

### 5.4 Finish Workout

**Endpoint:** `PUT /api/v1/workouts/{workoutId}/finish`

**Description:** Completes an active workout session and calculates total volume.

**Authentication:** Required (Bearer Token)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| workoutId | integer | Workout ID |

**Success Response (200 OK):**
```json
{
  "id": 456,
  "userId": 123,
  "workoutDate": "2025-12-10",
  "startTime": "2025-12-10T14:30:00.000Z",
  "endTime": "2025-12-10T15:45:00.000Z",
  "duration": "01:15:00",
  "notes": "Push Day - Feeling strong",
  "totalVolume": 5420.0,
  "totalSets": 12,
  "status": "COMPLETED",
  "exercises": [
    {
      "exerciseId": 1,
      "exerciseName": "Bench Press",
      "sets": 3,
      "volume": 1920.0
    },
    {
      "exerciseId": 7,
      "exerciseName": "Overhead Press",
      "sets": 3,
      "volume": 1350.0
    }
  ]
}
```

---

### 5.5 Get Workout History

**Endpoint:** `GET /api/v1/workouts/history`

**Description:** Retrieves user's workout history with optional date range filtering.

**Authentication:** Required (Bearer Token)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | No | Start date (ISO 8601) |
| endDate | date | No | End date (ISO 8601) |

**Example Request:**
```
GET /api/v1/workouts/history?startDate=2025-11-01&endDate=2025-12-10
```

**Success Response (200 OK):**
```json
{
  "workouts": [
    {
      "id": 456,
      "workoutDate": "2025-12-10",
      "duration": "01:15:00",
      "totalVolume": 5420.0,
      "totalSets": 12,
      "exerciseCount": 4,
      "notes": "Push Day - Feeling strong"
    },
    {
      "id": 455,
      "workoutDate": "2025-12-08",
      "duration": "01:20:00",
      "totalVolume": 5100.0,
      "totalSets": 15,
      "exerciseCount": 5,
      "notes": "Pull Day"
    }
  ],
  "statistics": {
    "totalWorkouts": 2,
    "totalVolume": 10520.0,
    "averageVolume": 5260.0,
    "totalDuration": "02:35:00"
  }
}
```

---

### 5.6 Get Workout Detail

**Endpoint:** `GET /api/v1/workouts/{workoutId}`

**Description:** Retrieves detailed information about a specific workout including all sets.

**Authentication:** Required (Bearer Token)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| workoutId | integer | Workout ID |

**Success Response (200 OK):**
```json
{
  "id": 456,
  "userId": 123,
  "workoutDate": "2025-12-10",
  "startTime": "2025-12-10T14:30:00.000Z",
  "endTime": "2025-12-10T15:45:00.000Z",
  "duration": "01:15:00",
  "notes": "Push Day - Feeling strong",
  "totalVolume": 5420.0,
  "status": "COMPLETED",
  "exercises": [
    {
      "exercise": {
        "id": 1,
        "name": "Bench Press",
        "muscleGroup": "CHEST"
      },
      "sets": [
        {
          "id": 789,
          "setNumber": 1,
          "reps": 8,
          "weightKg": 80.0,
          "rpe": 7,
          "volumeLoad": 640.0,
          "completedAt": "2025-12-10T14:35:00.000Z"
        },
        {
          "id": 790,
          "setNumber": 2,
          "reps": 8,
          "weightKg": 80.0,
          "rpe": 8,
          "volumeLoad": 640.0,
          "completedAt": "2025-12-10T14:38:00.000Z"
        }
      ],
      "totalVolume": 1920.0
    }
  ]
}
```

---

### 5.7 Update Workout Set

**Endpoint:** `PUT /api/v1/workouts/{workoutId}/sets/{setId}`

**Description:** Edits a previously logged set (for corrections).

**Authentication:** Required (Bearer Token)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| workoutId | integer | Workout ID |
| setId | integer | Set ID |

**Request Body:**
```json
{
  "reps": 10,
  "weightKg": 75.0,
  "rpe": 6
}
```

**Success Response (200 OK):**
```json
{
  "id": 789,
  "workoutId": 456,
  "setNumber": 1,
  "reps": 10,
  "weightKg": 75.0,
  "rpe": 6,
  "volumeLoad": 750.0,
  "completedAt": "2025-12-10T14:35:00.000Z",
  "updatedAt": "2025-12-10T16:00:00.000Z"
}
```

---

### 5.8 Delete Workout Set

**Endpoint:** `DELETE /api/v1/workouts/{workoutId}/sets/{setId}`

**Description:** Deletes a logged set.

**Authentication:** Required (Bearer Token)

**Success Response (204 No Content)**

---

## 6. Nutrition Endpoints

### 6.1 Search Foods

**Endpoint:** `GET /api/v1/nutrition/foods/search`

**Description:** Searches for foods in the database.

**Authentication:** Required (Bearer Token)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search term (min 2 chars) |
| limit | integer | No | Max results (default: 20) |

**Example Request:**
```
GET /api/v1/nutrition/foods/search?q=chicken&limit=10
```

**Success Response (200 OK):**
```json
{
  "results": [
    {
      "id": 101,
      "name": "Chicken Breast (Grilled)",
      "calories": 165.0,
      "proteinG": 31.0,
      "carbsG": 0.0,
      "fatG": 3.6,
      "servingSize": "100g",
      "brand": null
    },
    {
      "id": 102,
      "name": "Chicken Thigh (Skinless)",
      "calories": 209.0,
      "proteinG": 26.0,
      "carbsG": 0.0,
      "fatG": 10.9,
      "servingSize": "100g",
      "brand": null
    }
  ],
  "count": 2
}
```

---

### 6.2 Log Food

**Endpoint:** `POST /api/v1/nutrition/log`

**Description:** Logs consumed food to a meal.

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "foodItemId": 101,
  "date": "2025-12-10",
  "mealType": "LUNCH",
  "quantityG": 200.0
}
```

**Request Body Schema:**
| Field | Type | Required | Valid Values |
|-------|------|----------|--------------|
| foodItemId | integer | Yes | Valid food ID |
| date | date | Yes | ISO 8601 format |
| mealType | string | Yes | BREAKFAST, LUNCH, DINNER, SNACK |
| quantityG | decimal | Yes | > 0 |

**Success Response (201 Created):**
```json
{
  "id": 567,
  "userId": 123,
  "food": {
    "id": 101,
    "name": "Chicken Breast (Grilled)"
  },
  "date": "2025-12-10",
  "mealType": "LUNCH",
  "quantityG": 200.0,
  "calculatedNutrition": {
    "calories": 330.0,
    "protein": 62.0,
    "carbs": 0.0,
    "fat": 7.2
  },
  "loggedAt": "2025-12-10T12:30:00.000Z"
}
```

**Calculation Logic:**
```
multiplier = quantityG / 100
calories = food.calories × multiplier
protein = food.proteinG × multiplier
carbs = food.carbsG × multiplier
fat = food.fatG × multiplier

Example: 200g chicken = (200 / 100) × base values = 2.0 × base values
```

---

### 6.3 Get Daily Nutrition Summary

**Endpoint:** `GET /api/v1/nutrition/daily/{date}`

**Description:** Retrieves nutrition summary for a specific date.

**Authentication:** Required (Bearer Token)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| date | date | Date in ISO 8601 format (YYYY-MM-DD) |

**Example Request:**
```
GET /api/v1/nutrition/daily/2025-12-10
```

**Success Response (200 OK):**
```json
{
  "date": "2025-12-10",
  "targets": {
    "calories": 2368.3,
    "protein": 177.6,
    "carbs": 236.8,
    "fat": 78.9
  },
  "consumed": {
    "calories": 1850.5,
    "protein": 145.2,
    "carbs": 180.0,
    "fat": 62.3
  },
  "remaining": {
    "calories": 517.8,
    "protein": 32.4,
    "carbs": 56.8,
    "fat": 16.6
  },
  "percentages": {
    "calories": 78.1,
    "protein": 81.8,
    "carbs": 76.0,
    "fat": 79.0
  },
  "meals": {
    "BREAKFAST": {
      "calories": 450.0,
      "protein": 30.0,
      "carbs": 50.0,
      "fat": 15.0,
      "items": [
        {
          "id": 565,
          "food": "Oatmeal",
          "quantity": 80.0,
          "calories": 311.2
        },
        {
          "id": 566,
          "food": "Banana",
          "quantity": 120.0,
          "calories": 106.8
        }
      ]
    },
    "LUNCH": {
      "calories": 700.0,
      "protein": 65.0,
      "carbs": 70.0,
      "fat": 25.0,
      "items": [
        {
          "id": 567,
          "food": "Chicken Breast (Grilled)",
          "quantity": 200.0,
          "calories": 330.0
        }
      ]
    },
    "DINNER": {
      "calories": 650.5,
      "protein": 48.2,
      "carbs": 55.0,
      "fat": 20.3,
      "items": []
    },
    "SNACK": {
      "calories": 50.0,
      "protein": 2.0,
      "carbs": 5.0,
      "fat": 2.0,
      "items": []
    }
  }
}
```

---

### 6.4 Delete Nutrition Log

**Endpoint:** `DELETE /api/v1/nutrition/log/{logId}`

**Description:** Deletes a nutrition log entry.

**Authentication:** Required (Bearer Token)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| logId | integer | Nutrition log ID |

**Success Response (204 No Content)**

---

## 7. Metrics & Dashboard Endpoints

### 7.1 Get Dashboard Summary

**Endpoint:** `GET /api/v1/metrics/dashboard`

**Description:** Retrieves summary data for the main dashboard.

**Authentication:** Required (Bearer Token)

**Success Response (200 OK):**
```json
{
  "date": "2025-12-10",
  "greeting": "Good afternoon",
  "userName": "John",
  "todayStats": {
    "waterMl": 1500,
    "waterTarget": 2500,
    "waterPercentage": 60.0,
    "caloriesConsumed": 1850.5,
    "caloriesTarget": 2368.3,
    "caloriesRemaining": 517.8,
    "caloriesPercentage": 78.1,
    "currentWeight": 82.5,
    "targetWeight": 75.0
  },
  "weekStats": {
    "workoutsCompleted": 4,
    "workoutsTarget": 5,
    "totalVolume": 22500.0,
    "averageVolume": 5625.0
  },
  "recentWorkouts": [
    {
      "id": 456,
      "date": "2025-12-10",
      "duration": "01:15:00",
      "volume": 5420.0
    },
    {
      "id": 455,
      "date": "2025-12-08",
      "duration": "01:20:00",
      "volume": 5100.0
    }
  ],
  "recommendations": [
    {
      "type": "PROGRESSIVE_OVERLOAD",
      "message": "Try increasing weight on Bench Press - your last 3 sets had RPE < 7",
      "priority": "HIGH"
    }
  ]
}
```

---

### 7.2 Log Weight

**Endpoint:** `POST /api/v1/metrics/weight`

**Description:** Records body weight for a specific date.

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "date": "2025-12-10",
  "weightKg": 82.5
}
```

**Success Response (201 Created):**
```json
{
  "id": 234,
  "userId": 123,
  "date": "2025-12-10",
  "weightKg": 82.5,
  "difference": -0.3,
  "differenceSinceStart": -2.5,
  "loggedAt": "2025-12-10T07:00:00.000Z"
}
```

---

### 7.3 Add Water

**Endpoint:** `PATCH /api/v1/metrics/water`

**Description:** Increments daily water intake.

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "milliliters": 250
}
```

**Success Response (200 OK):**
```json
{
  "date": "2025-12-10",
  "waterMl": 1750,
  "target": 2500,
  "percentage": 70.0,
  "updatedAt": "2025-12-10T15:30:00.000Z"
}
```

---

### 7.4 Get Weight Trend

**Endpoint:** `GET /api/v1/metrics/weight/trend`

**Description:** Retrieves weight data with trend line for charting.

**Authentication:** Required (Bearer Token)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | No | Start date (default: 3 months ago) |
| endDate | date | No | End date (default: today) |
| period | string | No | WEEK, MONTH, QUARTER (default: MONTH) |

**Example Request:**
```
GET /api/v1/metrics/weight/trend?period=MONTH
```

**Success Response (200 OK):**
```json
{
  "startDate": "2025-11-10",
  "endDate": "2025-12-10",
  "dataPoints": [
    {
      "date": "2025-11-10",
      "weightKg": 85.0
    },
    {
      "date": "2025-11-17",
      "weightKg": 84.2
    },
    {
      "date": "2025-11-24",
      "weightKg": 83.5
    },
    {
      "date": "2025-12-01",
      "weightKg": 83.0
    },
    {
      "date": "2025-12-10",
      "weightKg": 82.5
    }
  ],
  "trendLine": [
    {
      "date": "2025-11-10",
      "value": 85.0
    },
    {
      "date": "2025-11-17",
      "value": 84.3
    },
    {
      "date": "2025-11-24",
      "value": 83.6
    },
    {
      "date": "2025-12-01",
      "value": 82.9
    },
    {
      "date": "2025-12-10",
      "value": 82.5
    }
  ],
  "statistics": {
    "startWeight": 85.0,
    "currentWeight": 82.5,
    "totalChange": -2.5,
    "averageWeeklyChange": -0.6,
    "projectedWeight": 80.0,
    "daysToGoal": 42
  }
}
```

---

### 7.5 Log Sleep

**Endpoint:** `POST /api/v1/metrics/sleep`

**Description:** Records sleep data.

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "date": "2025-12-10",
  "hours": 7.5,
  "quality": "GOOD"
}
```

**Request Body Schema:**
| Field | Type | Required | Valid Values |
|-------|------|----------|--------------|
| date | date | Yes | ISO 8601 format |
| hours | decimal | Yes | 0-24 |
| quality | string | No | POOR, FAIR, GOOD, EXCELLENT |

**Success Response (201 Created):**
```json
{
  "id": 345,
  "userId": 123,
  "date": "2025-12-10",
  "hours": 7.5,
  "quality": "GOOD",
  "loggedAt": "2025-12-10T08:00:00.000Z"
}
```

---

## 8. Error Responses

### Standard Error Format

All error responses follow this format:
```json
{
  "timestamp": "2025-12-10T10:30:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Detailed error message",
  "path": "/api/v1/endpoint",
  "fieldErrors": [
    {
      "field": "email",
      "message": "Email must be valid"
    }
  ]
}
```

### HTTP Status Codes

| Code | Description | When Used |
|------|-------------|-----------|
| 200 | OK | Successful GET, PUT, PATCH requests |
| 201 | Created | Successful POST requests creating resources |
| 204 | No Content | Successful DELETE requests |
| 400 | Bad Request | Invalid request body, validation errors |
| 401 | Unauthorized | Missing/invalid/expired token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 422 | Unprocessable Entity | Business logic validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

### Common Error Scenarios

#### 1. Authentication Errors
```json
// Missing token
{
  "timestamp": "2025-12-10T10:30:00.000Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authorization header missing",
  "path": "/api/v1/profile"
}

// Invalid token
{
  "timestamp": "2025-12-10T10:30:00.000Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid JWT token",
  "path": "/api/v1/profile"
}

// Expired token
{
  "timestamp": "2025-12-10T10:30:00.000Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token has expired",
  "path": "/api/v1/profile"
}
```

#### 2. Validation Errors
```json
{
  "timestamp": "2025-12-10T10:30:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/workouts/456/sets",
  "fieldErrors": [
    {
      "field": "reps",
      "rejectedValue": -5,
      "message": "Reps must be greater than 0"
    },
    {
      "field": "weightKg",
      "rejectedValue": null,
      "message": "Weight is required"
    }
  ]
}
```

#### 3. Business Logic Errors
```json
{
  "timestamp": "2025-12-10T10:30:00.000Z",
  "status": 422,
  "error": "Unprocessable Entity",
  "message": "Cannot log set to completed workout",
  "path": "/api/v1/workouts/456/sets"
}
```

---

## 9. OpenAPI Specification

### Full OpenAPI 3.0 YAML

```yaml
openapi: 3.0.3
info:
  title: FitTrack Pro API
  description: REST API for FitTrack Pro fitness tracking application
  version: 1.0.0
  contact:
    name: FitTrack Pro Support
    email: support@fittrack.com

servers:
  - url: https://api.fittrack.com/api/v1
    description: Production server
  - url: http://localhost:8080/api/v1
    description: Development server

security:
  - BearerAuth: []

tags:
  - name: Authentication
    description: User authentication and authorization
  - name: Profile
    description: User profile management
  - name: Exercises
    description: Exercise catalog
  - name: Workouts
    description: Workout tracking and history
  - name: Nutrition
    description: Food logging and nutrition tracking
  - name: Metrics
    description: Body metrics and dashboard

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT access token obtained from /auth/login or /auth/register

  schemas:
    # Auth Schemas
    RegisterRequest:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
          example: user@example.com
        password:
          type: string
          format: password
          minLength: 8
          pattern: '^(?=.*[A-Z])(?=.*[0-9]).*$'
          example: SecurePass123

    LoginRequest:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          format: password

    AuthResponse:
      type: object
      properties:
        accessToken:
          type: string
        refreshToken:
          type: string
        email:
          type: string
        userId:
          type: integer

    # Profile Schemas
    ProfileRequest:
      type: object
      required:
        - heightCm
        - dateOfBirth
        - gender
        - activityLevel
        - weightGoal
        - targetWeightKg
        - currentWeightKg
      properties:
        heightCm:
          type: number
          format: decimal
          minimum: 1
        dateOfBirth:
          type: string
          format: date
        gender:
          type: string
          enum: [MALE, FEMALE]
        activityLevel:
          type: string
          enum: [SEDENTARY, LIGHTLY_ACTIVE, MODERATELY_ACTIVE, VERY_ACTIVE, EXTRA_ACTIVE]
        weightGoal:
          type: string
          enum: [LOSE_SLOW, LOSE_MODERATE, LOSE_FAST, MAINTAIN, GAIN_SLOW, GAIN_MODERATE]
        targetWeightKg:
          type: number
          format: decimal
        currentWeightKg:
          type: number
          format: decimal

    # Workout Schemas
    WorkoutStartRequest:
      type: object
      required:
        - date
      properties:
        date:
          type: string
          format: date
        notes:
          type: string

    WorkoutSetRequest:
      type: object
      required:
        - exerciseId
        - setNumber
        - reps
        - weightKg
      properties:
        exerciseId:
          type: integer
        setNumber:
          type: integer
          minimum: 1
        reps:
          type: integer
          minimum: 1
        weightKg:
          type: number
          format: decimal
          minimum: 0
        rpe:
          type: integer
          minimum: 1
          maximum: 10

    # Nutrition Schemas
    NutritionLogRequest:
      type: object
      required:
        - foodItemId
        - date
        - mealType
        - quantityG
      properties:
        foodItemId:
          type: integer
        date:
          type: string
          format: date
        mealType:
          type: string
          enum: [BREAKFAST, LUNCH, DINNER, SNACK]
        quantityG:
          type: number
          format: decimal
          minimum: 0

    # Error Schema
    ErrorResponse:
      type: object
      properties:
        timestamp:
          type: string
          format: date-time
        status:
          type: integer
        error:
          type: string
        message:
          type: string
        path:
          type: string
        fieldErrors:
          type: array
          items:
            type: object
            properties:
              field:
                type: string
              message:
                type: string

  responses:
    UnauthorizedError:
      description: Access token is missing or invalid
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'

    BadRequestError:
      description: Invalid request parameters
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'

    NotFoundError:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'

paths:
  /auth/register:
    post:
      tags:
        - Authentication
      summary: Register new user
      description: Creates a new user account
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterRequest'
      responses:
        '201':
          description: User created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '400':
          $ref: '#/components/responses/BadRequestError'
        '409':
          description: Email already exists
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /auth/login:
    post:
      tags:
        - Authentication
      summary: User login
      description: Authenticates user and returns JWT tokens
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '401':
          $ref: '#/components/responses/UnauthorizedError'

  /profile:
    post:
      tags:
        - Profile
      summary: Create or update profile
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProfileRequest'
      responses:
        '200':
          description: Profile updated successfully
        '401':
          $ref: '#/components/responses/UnauthorizedError'

  /workouts:
    post:
      tags:
        - Workouts
      summary: Start new workout
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/WorkoutStartRequest'
      responses:
        '201':
          description: Workout created
        '401':
          $ref: '#/components/responses/UnauthorizedError'

  /workouts/{workoutId}/sets:
    post:
      tags:
        - Workouts
      summary: Log workout set
      parameters:
        - in: path
          name: workoutId
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/WorkoutSetRequest'
      responses:
        '201':
          description: Set logged successfully
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '404':
          $ref: '#/components/responses/NotFoundError'

  /nutrition/log:
    post:
      tags:
        - Nutrition
      summary: Log food intake
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NutritionLogRequest'
      responses:
        '201':
          description: Food logged successfully
        '401':
          $ref: '#/components/responses/UnauthorizedError'
```

---

## Rate Limiting

**Limits:**
- Anonymous endpoints: 100 requests/hour
- Authenticated endpoints: 1000 requests/hour
- Burst limit: 20 requests/minute

**Rate Limit Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1702214400
```

---

## Pagination

All list endpoints support pagination with these query parameters:
- `page`: Page number (0-indexed)
- `size`: Items per page (max 100)
- `sort`: Sort field and direction (e.g., `date,desc`)

**Response includes pagination metadata:**
```json
{
  "content": [...],
  "page": {
    "size": 20,
    "number": 0,
    "totalElements": 156,
    "totalPages": 8
  }
}
```

---

**End of API Documentation**
