# FitTrack Pro - Testing Guide

## Overview

This document provides comprehensive testing guidelines for the FitTrack Pro application, including unit tests, integration tests, and manual testing procedures.

## Test Coverage Summary

### Backend Tests Created
- ✅ **AuthServiceTest** - Authentication service unit tests
- ✅ **WorkoutServiceTest** - Workout service unit tests
- ✅ **AuthControllerTest** - Auth controller integration tests

### Frontend Tests Available
- Angular CLI provides default test setup with Jasmine/Karma
- Component tests can be run with `ng test`
- E2E tests available with `ng e2e`

## Running Tests

### Backend Tests

```bash
cd fittrack-backend

# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=AuthServiceTest

# Run tests with coverage
mvn test jacoco:report

# Skip tests during build
mvn clean package -DskipTests
```

### Frontend Tests

```bash
cd fittrack-frontend

# Run unit tests (single run)
ng test --watch=false

# Run tests in watch mode
ng test

# Run tests with code coverage
ng test --code-coverage

# Run E2E tests
ng e2e
```

## Manual Testing Checklist

### Authentication Flow

#### Registration
- [ ] Navigate to `/auth/register`
- [ ] Enter valid email format
- [ ] Enter password with requirements (8+ chars, 1 uppercase, 1 digit)
- [ ] Click Register
- [ ] Verify redirect to `/dashboard`
- [ ] Verify JWT token saved in localStorage
- [ ] Verify user email displayed in navigation

**Test Cases:**
- ✅ Valid registration with `test@example.com` / `Password123`
- ✅ Duplicate email shows error
- ✅ Invalid email format shows validation error
- ✅ Weak password (no uppercase) shows error
- ✅ Weak password (no digit) shows error
- ✅ Password less than 8 chars shows error

#### Login
- [ ] Navigate to `/auth/login`
- [ ] Enter registered email
- [ ] Enter correct password
- [ ] Click Login
- [ ] Verify redirect to `/dashboard`
- [ ] Verify authentication token received

**Test Cases:**
- ✅ Valid login with existing account
- ✅ Invalid email shows error
- ✅ Wrong password shows error
- ✅ Network error shows friendly message

#### Logout
- [ ] Click Logout button
- [ ] Verify redirect to `/auth/login`
- [ ] Verify token removed from localStorage
- [ ] Verify cannot access protected routes

---

### Workout Tracking

#### Exercise Library
- [ ] Navigate to `/workout/exercises`
- [ ] Verify 15 exercises loaded
- [ ] Search for "bench" - verify Bench Press appears
- [ ] Filter by LEGS muscle group - verify Squat, Leg Press appear
- [ ] Filter by BARBELL equipment - verify correct exercises
- [ ] Click "Clear Filters" - verify all exercises shown
- [ ] Test pagination (if more than 20 items)

**Test Cases:**
- ✅ All 15 exercises display correctly
- ✅ Search filters in real-time (300ms debounce)
- ✅ Muscle group filter works
- ✅ Equipment type filter works
- ✅ Combined filters work together
- ✅ Clear filters resets view

#### Start Workout
- [ ] Navigate to `/workout/session`
- [ ] Click "Start New Workout"
- [ ] Verify workout created with today's date
- [ ] Verify stats show: Volume: 0 kg, Sets: 0, Exercises: 0

**Test Cases:**
- ✅ Cannot log sets before starting workout
- ✅ Can only have one active workout
- ✅ Start button disabled during creation

#### Log Sets
- [ ] Select exercise from dropdown
- [ ] Enter reps (e.g., 10)
- [ ] Enter weight in kg (e.g., 60)
- [ ] Select RPE 1-10 (optional)
- [ ] Click "Log Set"
- [ ] Verify set appears in "Today's Sets" section
- [ ] Verify volume updates (10 × 60 = 600 kg)
- [ ] Verify set count increments

**Test Cases:**
- ✅ Cannot submit with empty reps
- ✅ Cannot submit with negative weight
- ✅ Volume calculation correct (reps × weight)
- ✅ RPE is optional
- ✅ Multiple sets for same exercise work
- ✅ Different exercises in same workout work

#### Rest Timer
- [ ] Click "Start Rest Timer"
- [ ] Verify countdown from 1:30
- [ ] Click "Pause" - verify timer pauses
- [ ] Click "Resume" - verify timer continues
- [ ] Click "Stop" - verify timer resets
- [ ] Wait for timer to reach 0:00 - verify alert/sound (if implemented)

**Test Cases:**
- ✅ Timer counts down correctly
- ✅ Pause/resume works
- ✅ Stop resets to 90 seconds
- ✅ Timer persists during page navigation (if implemented)

#### Finish Workout
- [ ] Click "Finish Workout" button (red)
- [ ] Confirm in dialog
- [ ] Verify workout completed
- [ ] Verify end time recorded
- [ ] Verify total volume calculated
- [ ] Verify can view in history

**Test Cases:**
- ✅ Cannot finish workout with no sets
- ✅ Confirmation dialog prevents accidental finish
- ✅ End time recorded correctly
- ✅ Total volume = sum of all set volumes
- ✅ Duration calculated (end - start time)

#### Workout History
- [ ] Navigate to `/workout/history`
- [ ] Verify past workouts displayed
- [ ] Click "This Week" filter
- [ ] Click "This Month" filter
- [ ] Select custom date range
- [ ] Verify summary stats update
- [ ] Click workout card - verify detail modal opens
- [ ] Verify all sets displayed in modal

**Test Cases:**
- ✅ Date filters work correctly
- ✅ Summary stats calculate correctly
- ✅ Empty state shows when no workouts
- ✅ Modal shows complete workout details
- ✅ Close modal works

---

### Profile Management

#### View Profile
- [ ] Navigate to `/profile`
- [ ] Verify "Coming Soon" message displayed
- [ ] Verify can navigate back to dashboard

**Test Cases:**
- ✅ Page loads without errors
- ✅ Navigation works

---

### Dashboard

#### Navigation
- [ ] Verify all nav links present (Dashboard, Workout, Exercises, History, Profile)
- [ ] Click each link - verify correct page loads
- [ ] Verify active link highlighted
- [ ] Verify user email displayed
- [ ] Verify logout button present

**Test Cases:**
- ✅ All navigation links work
- ✅ Active state shows correctly
- ✅ User email displays from token
- ✅ Logout functionality works

#### Quick Actions
- [ ] Click "Start Workout" card - verify navigates to `/workout/session`
- [ ] Click "Browse Exercises" - verify navigates to `/workout/exercises`
- [ ] Click "View History" - verify navigates to `/workout/history`
- [ ] Click "Profile" - verify navigates to `/profile`

**Test Cases:**
- ✅ All quick action cards navigate correctly
- ✅ Hover effects work
- ✅ Cards responsive on mobile

#### Active Workout Alert
- [ ] Start a workout
- [ ] Return to dashboard
- [ ] Verify orange alert banner appears
- [ ] Click "Resume Workout" - verify returns to session

**Test Cases:**
- ✅ Alert only shows when workout active
- ✅ Alert disappears after finishing workout
- ✅ Resume button works correctly

---

## API Testing

### Using cURL

#### Register
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}' \
  | python3 -m json.tool
```

#### Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}' \
  | python3 -m json.tool
```

#### Get Exercises (Authenticated)
```bash
TOKEN="your-jwt-token"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/exercises | python3 -m json.tool
```

#### Start Workout
```bash
curl -X POST http://localhost:8080/api/v1/workouts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-12-10","notes":"Test workout"}' \
  | python3 -m json.tool
```

#### Log Set
```bash
curl -X POST http://localhost:8080/api/v1/workouts/1/sets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"exerciseId":1,"setNumber":1,"reps":10,"weightKg":60.0,"rpe":7}' \
  | python3 -m json.tool
```

---

## Performance Testing

### Load Testing with Apache Bench

```bash
# Test login endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 -p login.json -T application/json \
  http://localhost:8080/api/v1/auth/login

# Test exercises endpoint (authenticated)
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/exercises
```

### Expected Performance
- **Login Response Time**: < 200ms
- **Exercise List**: < 100ms
- **Workout Creation**: < 150ms
- **Set Logging**: < 100ms
- **History Query**: < 200ms

---

## Security Testing

### Authentication Tests
- [ ] Access protected route without token - verify 401
- [ ] Use expired token - verify 401 and redirect to login
- [ ] Use malformed token - verify 401
- [ ] Access other user's data - verify 403

### Input Validation
- [ ] SQL injection attempts - verify sanitized
- [ ] XSS attempts in notes field - verify escaped
- [ ] Negative weight values - verify rejected
- [ ] Zero/negative reps - verify rejected
- [ ] Extremely large numbers - verify validation

### CORS Testing
- [ ] Request from localhost:4200 - verify allowed
- [ ] Request from other origin - verify blocked

---

## Test Data

### Pre-seeded Data
- **Users**: 6 test accounts (including finaltest@fittrack.com)
- **Exercises**: 15 exercises across all muscle groups
- **Food Items**: 20 common foods (Phase 3)

### Test Accounts
```
Email: finaltest@fittrack.com
Password: Password123
User ID: 6
```

### Sample Workout Data
```json
{
  "workoutId": 1,
  "sets": [
    {"exercise": "Bench Press", "reps": 10, "weight": 60, "rpe": 7},
    {"exercise": "Squat", "reps": 8, "weight": 100, "rpe": 8},
    {"exercise": "Deadlift", "reps": 5, "weight": 140, "rpe": 9}
  ],
  "totalVolume": 2100,
  "duration": "0 minutes"
}
```

---

## Continuous Integration

### GitHub Actions (Example)

```yaml
name: CI/CD Pipeline

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up JDK 25
        uses: actions/setup-java@v2
        with:
          java-version: '25'
      - name: Run tests
        run: |
          cd fittrack-backend
          mvn clean test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd fittrack-frontend
          npm install
      - name: Run tests
        run: |
          cd fittrack-frontend
          ng test --watch=false --code-coverage
```

---

## Test Coverage Goals

### Backend
- **Services**: > 80% coverage
- **Controllers**: > 70% coverage
- **Repositories**: Basic CRUD tests
- **DTOs**: Validation tests

### Frontend
- **Services**: > 75% coverage
- **Components**: > 60% coverage
- **Guards/Interceptors**: > 80% coverage

---

## Known Issues / Limitations

1. **Timer Persistence**: Rest timer resets on page refresh
2. **Offline Mode**: No offline support yet
3. **Image Upload**: Profile photos not implemented
4. **Workout Templates**: Not yet available
5. **Nutrition Tracking**: Phase 3 incomplete (40%)

---

## Testing Best Practices

1. **Always test with clean database state**
2. **Use test data, not production data**
3. **Test error cases, not just happy paths**
4. **Verify API responses match documentation**
5. **Check console for JavaScript errors**
6. **Test on multiple browsers (Chrome, Firefox, Safari)**
7. **Test responsive design on mobile devices**
8. **Verify security: auth, authorization, input validation**

---

## Bug Reporting Template

```markdown
**Title**: Brief description

**Environment**:
- OS: macOS/Windows/Linux
- Browser: Chrome 120
- Backend Version: 1.0.0
- Frontend Version: 1.0.0

**Steps to Reproduce**:
1. Navigate to...
2. Click...
3. Enter...

**Expected Behavior**:
Description...

**Actual Behavior**:
Description...

**Screenshots**:
[Attach if applicable]

**Console Logs**:
```
[Paste relevant logs]
```

**Additional Context**:
Any other relevant information...
```

---

**Document Version**: 1.0
**Last Updated**: December 2025
**Maintained By**: FitTrack Pro Team
