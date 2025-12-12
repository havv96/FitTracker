# FitTrack Pro - Comprehensive Fitness Tracking Platform

A full-stack web application for tracking workouts, nutrition, and fitness progress built with Spring Boot and Angular.

## 🎯 Features

### ✅ Phase 1: Foundation & Authentication
- User registration and login with JWT authentication
- Password validation (min 8 chars, 1 uppercase, 1 digit)
- Protected routes with auth guard
- Automatic token refresh

### ✅ Phase 2: Core Workout Tracking
- **Exercise Library**: 15 pre-loaded exercises with muscle group & equipment filters
- **Workout Sessions**: Start/stop workout tracking with live stats
- **Set Logging**: Track reps, weight (kg), and RPE (Rate of Perceived Exertion 1-10)
- **Volume Calculation**: Automatic calculation of volume load (reps × weight)
- **Rest Timer**: Countdown timer with pause/resume (default 90 seconds)
- **Workout History**: View past workouts with date range filters
- **Progress Tracking**: View detailed breakdown of all sets and exercises

### 🚧 Phase 3: Nutrition Tracking (In Progress - 40%)
- Food database with 20 common foods
- Macro tracking (calories, protein, carbs, fat)
- Daily nutrition logs with meal types

## 🏗️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: PostgreSQL 15
- **Security**: Spring Security + JWT (HS256)
- **ORM**: Hibernate/JPA
- **Migrations**: Flyway
- **Build**: Maven

### Frontend
- **Framework**: Angular 17+ (Standalone Components)
- **State Management**: Signals
- **Routing**: Lazy-loaded routes
- **HTTP**: Interceptors for auth & error handling
- **Styling**: SCSS with component-scoped styles

### DevOps
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL in Docker

## 📋 Prerequisites

- **Java 17** or higher
- **Node.js 18+** and npm
- **Docker** and Docker Compose
- **Maven 3.9+**
- **Angular CLI** (`npm install -g @angular/cli`)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd fittrack-frontend
```

### 2. Set Up Environment Variables
Create `.env` file in the root directory:
```env
# Database
DB_URL=jdbc:postgresql://localhost:5432/fittrack
DB_USER=fittrack_user
DB_PASSWORD=fittrack_pass

# JWT Configuration (Generate your own 256-bit secret!)
JWT_SECRET=<your-base64-encoded-secret-key>
JWT_ACCESS_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000

# Spring Profile
SPRING_PROFILE=dev

# Server
SERVER_PORT=8080
```

### 3. Start with Docker Compose (Recommended)
```bash
# Start PostgreSQL only (if you want to run backend/frontend separately)
docker-compose up -d postgres

# Or start all services (when frontend Dockerfile is ready)
docker-compose up -d
```

### 4. Run Backend
```bash
cd fittrack-backend
mvn clean install
mvn spring-boot:run
```

Backend will start on: `http://localhost:8080`

### 5. Run Frontend
```bash
cd fittrack-frontend
npm install
ng serve
```

Frontend will start on: `http://localhost:4200`

## 🗄️ Database Schema

The application uses Flyway migrations for database versioning:

- **V1**: Users table
- **V2**: User profiles table
- **V3**: Exercises table (15 seeded exercises)
- **V4**: Workouts table
- **V5**: Workout sets table
- **V6**: Food items table (20 seeded foods)
- **V7**: Nutrition logs table

## 🔐 Authentication

### Test Account
- **Email**: `finaltest@fittrack.com`
- **Password**: `Password123`

### API Authentication
All authenticated endpoints require a Bearer token:
```bash
Authorization: Bearer <your-jwt-token>
```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token

### Workouts
- `GET /api/v1/exercises` - Get all exercises
- `GET /api/v1/exercises/search` - Search exercises with filters
- `POST /api/v1/workouts` - Start new workout
- `POST /api/v1/workouts/{id}/sets` - Log a set
- `PUT /api/v1/workouts/{id}/finish` - Finish workout
- `GET /api/v1/workouts/history` - Get workout history
- `GET /api/v1/workouts/{id}` - Get workout details

### Profile
- `POST /api/v1/profile` - Create/update profile
- `GET /api/v1/profile` - Get profile with BMR/TDEE

## 🧪 Testing

### Backend Tests
```bash
cd fittrack-backend
mvn test
```

### Frontend Tests
```bash
cd fittrack-frontend
npm test
```

### E2E Tests
```bash
cd fittrack-frontend
ng e2e
```

## 🏭 Production Build

### Backend
```bash
cd fittrack-backend
mvn clean package -DskipTests
java -jar target/fittrack-backend-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd fittrack-frontend
ng build --configuration production
```

Build artifacts will be in `dist/fittrack-frontend/`

## 📊 Project Structure

```
fittrack-pro/
├── fittrack-backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/fittrack/
│   │   │   │   ├── config/         # Security, CORS config
│   │   │   │   ├── controller/     # REST controllers
│   │   │   │   ├── dto/            # Request/Response DTOs
│   │   │   │   ├── exception/      # Custom exceptions
│   │   │   │   ├── model/          # JPA entities
│   │   │   │   ├── repository/     # Spring Data repositories
│   │   │   │   ├── security/       # JWT, filters
│   │   │   │   └── service/        # Business logic
│   │   │   └── resources/
│   │   │       ├── db/migration/   # Flyway SQL scripts
│   │   │       └── application.yml # Spring config
│   │   └── test/                   # Unit tests
│   ├── Dockerfile
│   └── pom.xml
├── fittrack-frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/               # Services, guards, interceptors
│   │   │   ├── features/           # Feature modules
│   │   │   │   ├── auth/           # Login, register
│   │   │   │   ├── dashboard/      # Main dashboard
│   │   │   │   ├── workout/        # Workout tracking
│   │   │   │   └── profile/        # User profile
│   │   │   ├── shared/             # Shared components
│   │   │   ├── app.routes.ts       # Route configuration
│   │   │   └── app.config.ts       # App configuration
│   │   └── environments/           # Environment configs
│   ├── angular.json
│   └── package.json
├── docker-compose.yml
├── .env
├── .gitignore
└── README.md
```

## 🔧 Configuration

### Backend Application Properties
Located in `src/main/resources/application.yml`:
- Database connection
- JPA/Hibernate settings
- Flyway migrations
- JWT configuration
- Actuator endpoints
- Logging levels

### Frontend Environments
- `environment.ts` - Development config
- `environment.prod.ts` - Production config

## 📈 Database Seeded Data

### Exercises (15 total)
- **CHEST**: Bench Press, Incline Dumbbell Press, Push-ups
- **LEGS**: Squat, Leg Press, Romanian Deadlift
- **BACK**: Deadlift, Pull-up, Barbell Row, Lat Pulldown
- **SHOULDERS**: Overhead Press, Lateral Raise
- **ARMS**: Bicep Curl, Tricep Dip
- **CORE**: Plank

### Food Items (20 total)
- Proteins: Chicken, Salmon, Eggs, Greek Yogurt, Whey Protein
- Carbs: Brown Rice, Oatmeal, Banana, Sweet Potato, Bread
- Fats: Almonds, Avocado, Olive Oil, Peanut Butter
- Vegetables: Broccoli, Spinach
- Beverages: Milk, Orange Juice
- Snacks: Apple, Protein Bar

## 🐛 Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `docker ps`
- Verify database connection in `.env`
- Check logs: `tail -f /tmp/fittrack-backend.log`

### Frontend won't compile
- Clear cache: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`
- Check Node version: `node --version` (should be 18+)

### Database migration fails
- Check Flyway baseline: Look for version conflicts
- Reset database: `docker-compose down -v && docker-compose up -d postgres`

### JWT token expired
- Login again to get new tokens
- Check token expiration settings in `.env`

## 🚧 Roadmap

### Completed ✅
- Phase 1: Authentication & User Management
- Phase 2: Workout Tracking

### In Progress 🚧
- Phase 3: Nutrition Tracking (40%)

### Planned 📋
- Phase 4: Metrics & Analytics
- Phase 5: Smart Features & Recommendations
- Phase 6: Progressive Web App (PWA)

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributors

Built as a diploma project for fitness tracking and health management.

## 🙏 Acknowledgments

- Spring Boot community
- Angular team
- PostgreSQL team
- All open-source contributors

---

**Version**: 1.0.0 (MVP)
**Last Updated**: December 2025
