# Changelog

All notable changes to FitTrack Pro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-10

### 🎉 Phase 1: Foundation & Authentication - COMPLETE

This is the initial release of FitTrack Pro with core authentication functionality.

### Added - Backend

#### Infrastructure
- Spring Boot 3.2.0 application structure
- PostgreSQL 15 database with Docker support
- Flyway database migration system
- Maven build configuration
- Docker and Docker Compose setup
- Environment variable configuration (.env)

#### Database Schema
- `users` table with email, password_hash, role, timestamps
- `user_profiles` table with physical data and goals
- Database indexes for performance optimization
- Foreign key constraints and data validation

#### Security & Authentication
- JWT token-based authentication using HS256 algorithm
- BCrypt password hashing (strength: 12)
- Spring Security configuration
- JWT Token Provider with access and refresh tokens
- Authentication filter for request processing
- UserDetailsService implementation
- Access token expiration: 15 minutes
- Refresh token expiration: 7 days

#### API Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/profile` - Create/update user profile
- `GET /api/v1/profile` - Get user profile with calculations
- `GET /actuator/health` - Health check endpoint

#### Business Logic
- User registration with email validation
- Password strength validation (min 8 chars, 1 uppercase, 1 digit)
- BMR calculation using Mifflin-St Jeor equation
- TDEE calculation with activity level multipliers
- Recommended calorie calculation based on weight goals
- Macro target calculation (30% protein, 40% carbs, 30% fat)

#### Error Handling
- Global exception handler
- Custom exceptions (UserAlreadyExistsException, InvalidCredentialsException, ResourceNotFoundException)
- Field validation error responses
- HTTP status code mapping

#### Configuration
- CORS configuration for frontend integration
- Multi-profile support (dev, prod)
- Comprehensive application.yml configuration
- Hikari connection pool configuration

### Added - Frontend

#### Infrastructure
- Angular 18 application with standalone components
- TypeScript 5.x configuration
- SCSS styling setup
- Reactive Forms module
- RxJS for async operations

#### Core Services
- `AuthService` - Authentication and token management
- `ProfileService` - Profile CRUD operations
- LocalStorage integration for token persistence
- Observable-based state management

#### Security
- `authInterceptor` - Automatic JWT token injection
- `authGuard` - Route protection
- Token refresh mechanism (prepared for implementation)

#### Components
- `LoginComponent` - User login with validation
- `RegisterComponent` - User registration with password requirements
- `ProfileComponent` - User dashboard
- Form validation with error messages
- Responsive design with gradient styling

#### Routing
- Lazy-loaded route configuration
- Protected routes with auth guard
- Redirect logic for unauthenticated users
- Query parameter support for return URLs

#### Models & Types
- `AuthResponse` interface
- `LoginRequest` & `RegisterRequest` interfaces
- `ProfileRequest` & `ProfileResponse` interfaces
- `User` interface
- Enum types for gender, activity level, weight goals

#### UI/UX
- Modern gradient design (purple theme)
- Responsive layout
- Form validation feedback
- Loading states
- Error message display
- Success notifications

### Changed
- None (initial release)

### Deprecated
- None

### Removed
- None

### Fixed
- JWT key size issue: Changed from HS512 to HS256 for compatibility
- TypeScript strict mode issues in profile service
- CORS preflight request handling

### Security
- Password hashing with BCrypt (cost factor: 12)
- JWT tokens with secure secret key (512-bit)
- Protected API endpoints
- SQL injection prevention through JPA
- XSS protection headers
- CSRF protection (disabled for REST API)

## [Unreleased] - Phase 2

### Planned Features
- Exercise library with 150+ exercises
- Workout session tracking
- Set logging (weight, reps, RPE)
- Workout history
- Progressive overload tracking
- Exercise search and filtering

## [Future] - Phase 3

### Planned Features
- Food database integration
- Daily nutrition logging
- Macro and calorie tracking
- Meal planning
- Nutrition goals and recommendations

## [Future] - Phase 4

### Planned Features
- Progress dashboard with charts
- Body weight tracking
- Strength progression analytics
- Smart workout recommendations
- Inactivity reminders
- Export data functionality

---

## Version History

- **v1.0.0** (2025-12-10) - Phase 1: Foundation & Authentication
- **v0.0.0** (2025-12-09) - Project initialization

## Notes

### Database Migrations
- V1: Create users table
- V2: Create user_profiles table

### API Version
- Current: v1
- Base URL: `/api/v1`

### Breaking Changes
- None (initial release)

---

For more details, see:
- [README.md](README.md) - Full documentation
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference
