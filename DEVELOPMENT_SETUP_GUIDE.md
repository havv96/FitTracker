# Development Setup Guide: FitTrack Pro

**Project:** FitTrack Pro
**Version:** 1.0
**Date:** 10.12.2025
**Status:** Setup Instructions

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Environment Setup](#2-environment-setup)
3. [Database Setup](#3-database-setup)
4. [Backend Setup (Spring Boot)](#4-backend-setup-spring-boot)
5. [Frontend Setup (Angular)](#5-frontend-setup-angular)
6. [Docker Setup](#6-docker-setup)
7. [Running the Application](#7-running-the-application)
8. [Development Tools](#8-development-tools)
9. [Troubleshooting](#9-troubleshooting)
10. [Useful Commands](#10-useful-commands)

---

## 1. Prerequisites

### 1.1 Required Software

#### Java Development Kit (JDK)
- **Version:** JDK 17 or JDK 21 (LTS versions)
- **Download:** [OpenJDK](https://adoptium.net/) or [Oracle JDK](https://www.oracle.com/java/technologies/downloads/)

**Installation Verification:**
```bash
java -version
# Should output: openjdk version "17.0.x" or "21.0.x"

javac -version
# Should output: javac 17.0.x or 21.0.x
```

#### Node.js & npm
- **Version:** Node.js 18.x or 20.x (LTS)
- **Download:** [nodejs.org](https://nodejs.org/)

**Installation Verification:**
```bash
node --version
# Should output: v18.x.x or v20.x.x

npm --version
# Should output: 9.x.x or 10.x.x
```

#### PostgreSQL
- **Version:** PostgreSQL 15 or 16
- **Download:** [postgresql.org](https://www.postgresql.org/download/)

**Alternative:** Use Docker for PostgreSQL (recommended for development)

#### Docker & Docker Compose
- **Version:** Docker 24.x+, Docker Compose 2.x+
- **Download:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

**Installation Verification:**
```bash
docker --version
# Should output: Docker version 24.x.x

docker-compose --version
# Should output: Docker Compose version v2.x.x
```

#### Git
- **Version:** Git 2.x+
- **Download:** [git-scm.com](https://git-scm.com/)

**Installation Verification:**
```bash
git --version
# Should output: git version 2.x.x
```

### 1.2 Recommended IDEs

#### Backend Development
- **IntelliJ IDEA** (Ultimate or Community)
  - Download: [jetbrains.com/idea](https://www.jetbrains.com/idea/)
  - Recommended Plugins:
    - Spring Boot
    - Lombok
    - JPA Buddy
    - Database Navigator

- **VS Code** (Alternative)
  - Extensions:
    - Extension Pack for Java
    - Spring Boot Extension Pack
    - Lombok Annotations Support

#### Frontend Development
- **VS Code** (Recommended)
  - Extensions:
    - Angular Language Service
    - Angular Snippets
    - Prettier
    - ESLint
    - Auto Rename Tag
    - Path Intellisense

- **WebStorm** (Alternative)
  - Built-in Angular support

### 1.3 Optional Tools

- **Postman** or **Insomnia** - API testing
- **DBeaver** or **pgAdmin** - Database management
- **Git client** - GitKraken, SourceTree, or GitHub Desktop

---

## 2. Environment Setup

### 2.1 Clone the Repository

```bash
# Create project directory
mkdir fittrack-pro
cd fittrack-pro

# Clone repository (replace with actual repo URL)
git clone https://github.com/your-username/fittrack-backend.git
git clone https://github.com/your-username/fittrack-frontend.git

# Project structure should look like:
# fittrack-pro/
# ├── fittrack-backend/
# ├── fittrack-frontend/
# └── docker-compose.yml
```

### 2.2 Create Environment Files

#### Backend Environment (.env)
Create `fittrack-backend/.env`:
```env
# Database Configuration
DB_URL=jdbc:postgresql://localhost:5432/fittrack
DB_USER=fittrack_user
DB_PASSWORD=fittrack_pass

# JWT Configuration
JWT_SECRET=your-256-bit-secret-key-change-in-production-use-random-string
JWT_ACCESS_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000

# Spring Profile
SPRING_PROFILE=dev

# Server Configuration
SERVER_PORT=8080

# Logging Level
LOGGING_LEVEL=DEBUG
```

**Generate Secure JWT Secret:**
```bash
# On macOS/Linux
openssl rand -base64 64

# On Windows (PowerShell)
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

#### Frontend Environment
Create `fittrack-frontend/src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api/v1',
  enableServiceWorker: false,
  logLevel: 'debug'
};
```

Create `fittrack-frontend/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.fittrack.com/api/v1',
  enableServiceWorker: true,
  logLevel: 'error'
};
```

---

## 3. Database Setup

### 3.1 Using Docker (Recommended)

Create `docker-compose.yml` in project root:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: fittrack-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: fittrack
      POSTGRES_USER: fittrack_user
      POSTGRES_PASSWORD: fittrack_pass
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - fittrack-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fittrack_user -d fittrack"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local

networks:
  fittrack-network:
    driver: bridge
```

**Start PostgreSQL:**
```bash
docker-compose up -d postgres

# Verify container is running
docker ps

# View logs
docker-compose logs -f postgres
```

### 3.2 Using Local PostgreSQL Installation

**Create Database:**
```bash
# Connect to PostgreSQL
psql -U postgres

# In psql shell:
CREATE DATABASE fittrack;
CREATE USER fittrack_user WITH ENCRYPTED PASSWORD 'fittrack_pass';
GRANT ALL PRIVILEGES ON DATABASE fittrack TO fittrack_user;
\q
```

**Test Connection:**
```bash
psql -U fittrack_user -d fittrack -h localhost -p 5432
```

### 3.3 Database Schema Initialization

The database schema will be automatically created by Flyway migrations when you first run the backend application.

**Manual Migration (if needed):**
```bash
cd fittrack-backend
mvn flyway:migrate
```

---

## 4. Backend Setup (Spring Boot)

### 4.1 Install Dependencies

```bash
cd fittrack-backend

# Using Maven
mvn clean install

# Skip tests during initial setup
mvn clean install -DskipTests
```

**Expected Output:**
```
[INFO] BUILD SUCCESS
[INFO] Total time: 45.123 s
```

### 4.2 Project Structure Overview

```
fittrack-backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── fittrack/
│   │   │           ├── FitTrackApplication.java
│   │   │           ├── config/
│   │   │           ├── controller/
│   │   │           ├── service/
│   │   │           ├── repository/
│   │   │           ├── model/
│   │   │           ├── dto/
│   │   │           ├── exception/
│   │   │           └── security/
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── db/
│   │           └── migration/
│   │               ├── V1__create_users_table.sql
│   │               └── ...
│   └── test/
│       └── java/
├── pom.xml
├── .env
└── Dockerfile
```

### 4.3 Configure application.yml

**Main Configuration (`src/main/resources/application.yml`):**
```yaml
spring:
  application:
    name: fittrack-backend
  profiles:
    active: ${SPRING_PROFILE:dev}
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/fittrack}
    username: ${DB_USER:fittrack_user}
    password: ${DB_PASSWORD:fittrack_pass}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

jwt:
  secret: ${JWT_SECRET:default-secret-change-me}
  access-token-expiration: ${JWT_ACCESS_EXPIRATION:900000}
  refresh-token-expiration: ${JWT_REFRESH_EXPIRATION:604800000}

server:
  port: ${SERVER_PORT:8080}
  error:
    include-message: always
    include-stacktrace: on_param

logging:
  level:
    com.fittrack: ${LOGGING_LEVEL:INFO}
    org.springframework.web: INFO
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
```

**Development Profile (`application-dev.yml`):**
```yaml
spring:
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true

logging:
  level:
    com.fittrack: DEBUG
    org.springframework: INFO

server:
  error:
    include-stacktrace: always
```

**Production Profile (`application-prod.yml`):**
```yaml
spring:
  jpa:
    show-sql: false

logging:
  level:
    com.fittrack: INFO
    org.springframework: WARN

server:
  error:
    include-stacktrace: never
```

### 4.4 Run Backend Application

**Option 1: Using Maven**
```bash
cd fittrack-backend
mvn spring-boot:run

# With specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**Option 2: Using IDE**
- Open `FitTrackApplication.java`
- Click Run/Debug
- Set environment variables in run configuration

**Option 3: Using JAR**
```bash
# Build JAR
mvn clean package -DskipTests

# Run JAR
java -jar target/fittrack-backend-1.0.0.jar
```

**Verify Backend is Running:**
```bash
# Health check endpoint
curl http://localhost:8080/actuator/health

# Expected response:
# {"status":"UP"}
```

---

## 5. Frontend Setup (Angular)

### 5.1 Install Dependencies

```bash
cd fittrack-frontend

# Install Angular CLI globally (if not installed)
npm install -g @angular/cli@17

# Verify Angular CLI
ng version

# Install project dependencies
npm install
```

**Expected Output:**
```
added 1234 packages in 45s
```

### 5.2 Project Structure Overview

```
fittrack-frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── services/
│   │   │   └── models/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   ├── workout/
│   │   │   ├── nutrition/
│   │   │   └── metrics/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   └── pipes/
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── assets/
│   ├── environments/
│   ├── index.html
│   ├── main.ts
│   ├── styles.scss
│   ├── manifest.webmanifest
│   └── ngsw-config.json
├── angular.json
├── package.json
├── tsconfig.json
└── Dockerfile
```

### 5.3 Configure Angular App

**Update `angular.json` for proxy (optional for CORS):**
Create `proxy.conf.json`:
```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

**Update `angular.json`:**
```json
{
  "projects": {
    "fittrack-frontend": {
      "architect": {
        "serve": {
          "options": {
            "proxyConfig": "proxy.conf.json"
          }
        }
      }
    }
  }
}
```

### 5.4 Run Frontend Application

**Development Server:**
```bash
cd fittrack-frontend

# Start dev server
ng serve

# With specific port
ng serve --port 4200

# With proxy
ng serve --proxy-config proxy.conf.json

# Open automatically
ng serve --open
```

**Verify Frontend is Running:**
- Open browser: `http://localhost:4200`
- Should see FitTrack Pro welcome page

**Build for Production:**
```bash
# Production build
ng build --configuration production

# Output will be in dist/fittrack-frontend/
```

---

## 6. Docker Setup

### 6.1 Complete Docker Compose Configuration

Create `docker-compose.yml` in project root:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: fittrack-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: fittrack
      POSTGRES_USER: fittrack_user
      POSTGRES_PASSWORD: fittrack_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - fittrack-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fittrack_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./fittrack-backend
      dockerfile: Dockerfile
    container_name: fittrack-backend
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/fittrack
      SPRING_DATASOURCE_USERNAME: fittrack_user
      SPRING_DATASOURCE_PASSWORD: fittrack_pass
      JWT_SECRET: ${JWT_SECRET}
      SPRING_PROFILES_ACTIVE: prod
    ports:
      - "8080:8080"
    networks:
      - fittrack-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./fittrack-frontend
      dockerfile: Dockerfile
    container_name: fittrack-frontend
    restart: unless-stopped
    depends_on:
      - backend
    ports:
      - "80:80"
    networks:
      - fittrack-network

volumes:
  postgres_data:
    driver: local

networks:
  fittrack-network:
    driver: bridge
```

### 6.2 Backend Dockerfile

Create `fittrack-backend/Dockerfile`:
```dockerfile
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy JAR from build stage
COPY --from=build /app/target/fittrack-backend-*.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 6.3 Frontend Dockerfile

Create `fittrack-frontend/Dockerfile`:
```dockerfile
# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build -- --configuration=production

# Stage 2: Serve with nginx
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx content
RUN rm -rf ./*

# Copy built app
COPY --from=build /app/dist/fittrack-frontend/browser .

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 6.4 Nginx Configuration

Create `fittrack-frontend/nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Angular routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy (optional)
        location /api {
            proxy_pass http://backend:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 6.5 Run with Docker

**Start All Services:**
```bash
# Build and start
docker-compose up --build -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Stop Services:**
```bash
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v
```

**Rebuild Single Service:**
```bash
docker-compose up -d --build backend
```

---

## 7. Running the Application

### 7.1 Development Mode (Without Docker)

**Terminal 1 - Database:**
```bash
docker-compose up postgres
```

**Terminal 2 - Backend:**
```bash
cd fittrack-backend
mvn spring-boot:run
```

**Terminal 3 - Frontend:**
```bash
cd fittrack-frontend
ng serve
```

**Access Application:**
- Frontend: http://localhost:4200
- Backend API: http://localhost:8080/api/v1
- Database: localhost:5432

### 7.2 Production Mode (With Docker)

```bash
# Build and run all services
docker-compose up --build -d

# Access application
# Frontend: http://localhost
# Backend API: http://localhost:8080/api/v1
```

### 7.3 Testing the Setup

**1. Backend Health Check:**
```bash
curl http://localhost:8080/actuator/health
```

**2. Test Registration:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

**3. Test Login:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

**4. Access Frontend:**
- Open browser: http://localhost:4200
- Register new account
- Login
- Check dashboard loads

---

## 8. Development Tools

### 8.1 API Testing with Postman

**Import Postman Collection:**
1. Open Postman
2. Import → Link → Paste collection URL
3. Set environment variables:
   - `base_url`: http://localhost:8080/api/v1
   - `access_token`: (will be set after login)

**Example Collection Structure:**
```
FitTrack API
├── Auth
│   ├── Register
│   ├── Login
│   └── Refresh Token
├── Profile
│   ├── Get Profile
│   └── Update Profile
├── Workouts
│   ├── Get Exercises
│   ├── Start Workout
│   ├── Log Set
│   └── Finish Workout
└── Nutrition
    ├── Search Foods
    ├── Log Food
    └── Daily Summary
```

### 8.2 Database Management with DBeaver

**Connect to Database:**
1. Open DBeaver
2. New Database Connection
3. Select PostgreSQL
4. Configure:
   - Host: localhost
   - Port: 5432
   - Database: fittrack
   - Username: fittrack_user
   - Password: fittrack_pass
5. Test Connection → Finish

### 8.3 Git Workflow

**Branch Strategy:**
```bash
# Main branches
main        # Production-ready code
develop     # Development integration

# Feature branches
feature/authentication
feature/workout-tracking
feature/nutrition-logging

# Bugfix branches
bugfix/login-validation
```

**Typical Workflow:**
```bash
# Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/workout-tracking

# Make changes and commit
git add .
git commit -m "feat: add workout session tracking"

# Push to remote
git push origin feature/workout-tracking

# Create Pull Request on GitHub
# After review, merge to develop
```

---

## 9. Troubleshooting

### 9.1 Backend Issues

#### Issue: Port 8080 already in use
**Solution:**
```bash
# Find process using port
# macOS/Linux:
lsof -i :8080
kill -9 <PID>

# Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Or change port in application.yml
server:
  port: 8081
```

#### Issue: Database connection failed
**Solution:**
```bash
# Check if PostgreSQL is running
docker ps | grep fittrack-db

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres

# Verify connection
psql -U fittrack_user -d fittrack -h localhost
```

#### Issue: Flyway migration failed
**Solution:**
```bash
# Clean and re-migrate (WARNING: deletes data)
mvn flyway:clean
mvn flyway:migrate

# Or repair
mvn flyway:repair
```

### 9.2 Frontend Issues

#### Issue: npm install fails
**Solution:**
```bash
# Clear cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install --legacy-peer-deps
```

#### Issue: ng serve fails with CORS error
**Solution:**
1. Configure proxy (see Section 5.3)
2. Or add CORS configuration in backend:

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:4200");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
```

#### Issue: Angular build fails
**Solution:**
```bash
# Clear Angular cache
ng cache clean

# Update Angular CLI
npm install -g @angular/cli@latest

# Rebuild
ng build --configuration development
```

### 9.3 Docker Issues

#### Issue: Docker build fails
**Solution:**
```bash
# Remove old images
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check Docker logs
docker-compose logs backend
```

#### Issue: Container exits immediately
**Solution:**
```bash
# Check container logs
docker logs fittrack-backend

# Run container interactively
docker run -it fittrack-backend sh

# Check environment variables
docker exec fittrack-backend env
```

---

## 10. Useful Commands

### 10.1 Backend Commands

```bash
# Run application
mvn spring-boot:run

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Run tests
mvn test

# Run integration tests
mvn verify

# Package JAR
mvn clean package

# Skip tests during build
mvn clean package -DskipTests

# Generate code coverage report
mvn jacoco:report

# Run specific test
mvn test -Dtest=AuthServiceTest

# Format code
mvn spring-javaformat:apply

# Check dependencies
mvn dependency:tree
```

### 10.2 Frontend Commands

```bash
# Start dev server
ng serve

# Start with specific port
ng serve --port 4300

# Build for production
ng build --configuration production

# Run tests
ng test

# Run tests with coverage
ng test --code-coverage

# Run E2E tests
ng e2e

# Generate component
ng generate component features/workout/workout-session

# Generate service
ng generate service core/services/workout

# Generate guard
ng generate guard core/guards/auth

# Lint code
ng lint

# Update Angular
ng update @angular/cli @angular/core
```

### 10.3 Database Commands

```bash
# Connect to database
psql -U fittrack_user -d fittrack -h localhost

# In psql:
\dt              # List tables
\d users         # Describe table
\l               # List databases
\q               # Quit

# Backup database
pg_dump -U fittrack_user -d fittrack -h localhost > backup.sql

# Restore database
psql -U fittrack_user -d fittrack -h localhost < backup.sql

# Run SQL file
psql -U fittrack_user -d fittrack -h localhost -f script.sql
```

### 10.4 Docker Commands

```bash
# Build and start
docker-compose up --build -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart service
docker-compose restart backend

# Execute command in container
docker exec -it fittrack-backend sh

# View container stats
docker stats

# Remove unused images
docker image prune

# Clean everything
docker system prune -a --volumes
```

### 10.5 Git Commands

```bash
# Clone repository
git clone <repo-url>

# Create branch
git checkout -b feature/new-feature

# Stage changes
git add .

# Commit
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Pull latest changes
git pull origin develop

# Merge branch
git merge develop

# Rebase
git rebase develop

# View status
git status

# View history
git log --oneline --graph
```

---

## 11. Additional Resources

### 11.1 Documentation Links

- **Spring Boot:** https://spring.io/projects/spring-boot
- **Spring Data JPA:** https://spring.io/projects/spring-data-jpa
- **Spring Security:** https://spring.io/projects/spring-security
- **Angular:** https://angular.dev
- **PostgreSQL:** https://www.postgresql.org/docs/
- **Docker:** https://docs.docker.com/
- **Flyway:** https://flywaydb.org/documentation/

### 11.2 Learning Resources

- **Spring Boot Tutorial:** https://www.baeldung.com/spring-boot
- **Angular Tutorial:** https://angular.dev/tutorials
- **PostgreSQL Tutorial:** https://www.postgresqltutorial.com/
- **JWT Guide:** https://jwt.io/introduction

### 11.3 Community & Support

- **Stack Overflow:** [spring-boot](https://stackoverflow.com/questions/tagged/spring-boot), [angular](https://stackoverflow.com/questions/tagged/angular)
- **GitHub Issues:** Report bugs and feature requests
- **Discord/Slack:** Join FitTrack Pro community (if available)

---

## 12. Next Steps

After completing the setup:

1. ✅ Verify all services are running
2. ✅ Test authentication endpoints
3. ✅ Create test user account
4. ✅ Read through the API documentation
5. ✅ Review the implementation plan
6. ✅ Start development on Phase 1 features

**Happy Coding! 🚀**

---

## Appendix A: Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/fittrack` | Yes |
| `DB_USER` | Database username | `fittrack_user` | Yes |
| `DB_PASSWORD` | Database password | `fittrack_pass` | Yes |
| `JWT_SECRET` | Secret key for JWT signing | - | Yes |
| `JWT_ACCESS_EXPIRATION` | Access token expiration (ms) | `900000` (15 min) | No |
| `JWT_REFRESH_EXPIRATION` | Refresh token expiration (ms) | `604800000` (7 days) | No |
| `SPRING_PROFILE` | Active Spring profile | `dev` | No |
| `SERVER_PORT` | Server port | `8080` | No |
| `LOGGING_LEVEL` | Logging level | `INFO` | No |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `production` | Production mode | `false` |
| `apiBaseUrl` | Backend API URL | `http://localhost:8080/api/v1` |
| `enableServiceWorker` | Enable PWA service worker | `false` |
| `logLevel` | Console log level | `debug` |

---

## Appendix B: Port Reference

| Service | Port | Description |
|---------|------|-------------|
| Frontend (Dev) | 4200 | Angular dev server |
| Frontend (Prod) | 80 | Nginx |
| Backend | 8080 | Spring Boot API |
| PostgreSQL | 5432 | Database |

---

**End of Development Setup Guide**
