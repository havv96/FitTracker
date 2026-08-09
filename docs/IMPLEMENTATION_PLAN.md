# Implementation Plan: FitTrack Pro
**Project:** FitTrack Pro - Fitness & Health Tracking PWA
**Version:** 1.0
**Date:** 10.12.2025
**Status:** Ready for Implementation

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Development Environment Setup](#2-development-environment-setup)
3. [Phase 1: Foundation & Authentication](#3-phase-1-foundation--authentication)
4. [Phase 2: Core Workout Tracking](#4-phase-2-core-workout-tracking)
5. [Phase 3: Nutrition & Metrics](#5-phase-3-nutrition--metrics)
6. [Phase 4: Smart Features & PWA](#6-phase-4-smart-features--pwa)
7. [Testing Strategy](#7-testing-strategy)
8. [Deployment Strategy](#8-deployment-strategy)
9. [Timeline & Milestones](#9-timeline--milestones)

---

## 1. Project Overview

### 1.1 Technical Stack Summary
- **Backend:** Java 17/21 with Spring Boot 3.x
- **Frontend:** Angular 17+ (Standalone Components + Signals)
- **Database:** PostgreSQL 15+
- **Security:** Spring Security + JWT (Access & Refresh Tokens)
- **Containerization:** Docker & Docker Compose
- **API Style:** RESTful API with Base URL: `/api/v1`

### 1.2 Architecture Pattern
**Layered Architecture:**
1. Client Layer (Angular PWA)
2. API Layer (Spring Web Controllers)
3. Service Layer (Business Logic)
4. Data Layer (Spring Data JPA + PostgreSQL)

---

## 2. Development Environment Setup

### 2.1 Prerequisites Installation
```bash
# Required Software
- Java 17 or 21 (OpenJDK or Oracle JDK)
- Node.js 18+ and npm 9+
- PostgreSQL 15+
- Docker Desktop
- Git
- IDE (IntelliJ IDEA / VS Code)
```

### 2.2 Project Structure Initialization

#### Backend Structure (Spring Boot)
```
fittrack-backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── fittrack/
│   │   │           ├── FitTrackApplication.java
│   │   │           ├── config/
│   │   │           │   ├── SecurityConfig.java
│   │   │           │   ├── JwtConfig.java
│   │   │           │   └── CorsConfig.java
│   │   │           ├── controller/
│   │   │           │   ├── AuthController.java
│   │   │           │   ├── WorkoutController.java
│   │   │           │   ├── NutritionController.java
│   │   │           │   └── MetricsController.java
│   │   │           ├── service/
│   │   │           │   ├── AuthService.java
│   │   │           │   ├── UserProfileService.java
│   │   │           │   ├── WorkoutService.java
│   │   │           │   ├── NutritionService.java
│   │   │           │   └── MetricsService.java
│   │   │           ├── repository/
│   │   │           │   ├── UserRepository.java
│   │   │           │   ├── UserProfileRepository.java
│   │   │           │   ├── ExerciseRepository.java
│   │   │           │   ├── WorkoutRepository.java
│   │   │           │   ├── WorkoutSetRepository.java
│   │   │           │   ├── FoodItemRepository.java
│   │   │           │   ├── NutritionLogRepository.java
│   │   │           │   └── DailyStatsRepository.java
│   │   │           ├── model/
│   │   │           │   ├── User.java
│   │   │           │   ├── UserProfile.java
│   │   │           │   ├── Exercise.java
│   │   │           │   ├── Workout.java
│   │   │           │   ├── WorkoutSet.java
│   │   │           │   ├── FoodItem.java
│   │   │           │   ├── NutritionLog.java
│   │   │           │   └── DailyStats.java
│   │   │           ├── dto/
│   │   │           │   ├── request/
│   │   │           │   │   ├── RegisterRequest.java
│   │   │           │   │   ├── LoginRequest.java
│   │   │           │   │   ├── WorkoutStartRequest.java
│   │   │           │   │   └── NutritionLogRequest.java
│   │   │           │   └── response/
│   │   │           │       ├── AuthResponse.java
│   │   │           │       ├── UserProfileResponse.java
│   │   │           │       ├── WorkoutHistoryResponse.java
│   │   │           │       └── DashboardResponse.java
│   │   │           ├── exception/
│   │   │           │   ├── GlobalExceptionHandler.java
│   │   │           │   ├── UserAlreadyExistsException.java
│   │   │           │   └── InvalidCredentialsException.java
│   │   │           └── security/
│   │   │               ├── JwtTokenProvider.java
│   │   │               ├── JwtAuthenticationFilter.java
│   │   │               └── UserDetailsServiceImpl.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── db/
│   │           └── migration/
│   │               ├── V1__create_users_table.sql
│   │               ├── V2__create_user_profiles_table.sql
│   │               ├── V3__create_exercises_table.sql
│   │               ├── V4__create_workouts_table.sql
│   │               ├── V5__create_workout_sets_table.sql
│   │               ├── V6__create_food_items_table.sql
│   │               ├── V7__create_nutrition_logs_table.sql
│   │               └── V8__create_daily_stats_table.sql
│   └── test/
│       └── java/
│           └── com/
│               └── fittrack/
│                   ├── controller/
│                   ├── service/
│                   └── integration/
├── pom.xml
└── Dockerfile
```

#### Frontend Structure (Angular)
```
fittrack-frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── jwt.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── api.service.ts
│   │   │   │   └── storage.service.ts
│   │   │   └── models/
│   │   │       ├── user.model.ts
│   │   │       ├── workout.model.ts
│   │   │       └── nutrition.model.ts
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   ├── login.component.ts
│   │   │   │   │   ├── login.component.html
│   │   │   │   │   └── login.component.scss
│   │   │   │   └── register/
│   │   │   │       ├── register.component.ts
│   │   │   │       ├── register.component.html
│   │   │   │       └── register.component.scss
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   ├── dashboard.component.html
│   │   │   │   └── dashboard.component.scss
│   │   │   ├── profile/
│   │   │   │   ├── profile.component.ts
│   │   │   │   └── ...
│   │   │   ├── workout/
│   │   │   │   ├── exercise-list/
│   │   │   │   ├── workout-session/
│   │   │   │   ├── workout-history/
│   │   │   │   └── routine-builder/
│   │   │   ├── nutrition/
│   │   │   │   ├── food-search/
│   │   │   │   ├── food-log/
│   │   │   │   └── macro-tracker/
│   │   │   └── metrics/
│   │   │       ├── water-tracker/
│   │   │       ├── weight-chart/
│   │   │       └── progress-gallery/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── navbar/
│   │   │   │   ├── loading-spinner/
│   │   │   │   └── rest-timer/
│   │   │   └── pipes/
│   │   │       └── ...
│   │   └── app.component.ts
│   ├── assets/
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── index.html
│   ├── manifest.webmanifest
│   ├── ngsw-config.json (Service Worker Config)
│   └── styles.scss
├── angular.json
├── package.json
├── tsconfig.json
└── Dockerfile
```

### 2.3 Docker Setup
Create `docker-compose.yml` in root:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: fittrack-db
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

  backend:
    build:
      context: ./fittrack-backend
      dockerfile: Dockerfile
    container_name: fittrack-backend
    depends_on:
      - postgres
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/fittrack
      SPRING_DATASOURCE_USERNAME: fittrack_user
      SPRING_DATASOURCE_PASSWORD: fittrack_pass
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "8080:8080"
    networks:
      - fittrack-network

  frontend:
    build:
      context: ./fittrack-frontend
      dockerfile: Dockerfile
    container_name: fittrack-frontend
    depends_on:
      - backend
    ports:
      - "4200:80"
    networks:
      - fittrack-network

volumes:
  postgres_data:

networks:
  fittrack-network:
    driver: bridge
```

---

## 3. Phase 1: Foundation & Authentication

### 3.1 Database Schema Implementation

#### Task 3.1.1: Create Base Schema
**File:** `V1__create_users_table.sql`
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

**File:** `V2__create_user_profiles_table.sql`
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

### 3.2 Backend - Authentication Module

#### Task 3.2.1: Entity Classes
**Reference:** US-01, US-02, FR-AUTH-01, FR-AUTH-02

Create `User.java`:
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String role = "USER";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Getters, Setters, Constructors
}
```

Create `UserProfile.java`:
```java
@Entity
@Table(name = "user_profiles")
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(name = "height_cm")
    private BigDecimal heightCm;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    private String gender;

    @Column(name = "activity_level")
    private String activityLevel;

    @Column(name = "weight_goal")
    private String weightGoal;

    @Column(name = "target_weight_kg")
    private BigDecimal targetWeightKg;

    // Getters, Setters
}
```

#### Task 3.2.2: Security Configuration
**File:** `SecurityConfig.java`
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

#### Task 3.2.3: JWT Token Provider
**File:** `JwtTokenProvider.java`
```java
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration; // 15 minutes

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration; // 7 days

    public String generateAccessToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    public String generateRefreshToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    public String getEmailFromToken(String token) {
        return Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
```

#### Task 3.2.4: Authentication Controller
**File:** `AuthController.java`
**Endpoints:** `/api/v1/auth/register`, `/api/v1/auth/login`
```java
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshAccessToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }
}
```

#### Task 3.2.5: Authentication Service
**File:** `AuthService.java`
```java
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        // AC: Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already in use");
        }

        // AC: Validate password complexity (min 8 chars, 1 digit, 1 uppercase)
        validatePassword(request.getPassword());

        // AC: Hash password with BCrypt
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        // Generate tokens
        String accessToken = tokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        return new AuthResponse(accessToken, refreshToken, user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        try {
            // AC: Authenticate user
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
                )
            );
        } catch (AuthenticationException e) {
            // AC: Return 401 for invalid credentials
            throw new InvalidCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        // AC: Generate JWT tokens
        String accessToken = tokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        return new AuthResponse(accessToken, refreshToken, user.getEmail());
    }

    private void validatePassword(String password) {
        if (password.length() < 8 ||
            !password.matches(".*[0-9].*") ||
            !password.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException(
                "Password must be at least 8 characters with 1 digit and 1 uppercase letter"
            );
        }
    }
}
```

### 3.3 Frontend - Authentication Module

#### Task 3.3.1: Auth Service
**File:** `auth.service.ts`
```typescript
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/auth`;

  // Using Angular Signals
  isAuthenticated = signal<boolean>(false);
  currentUser = signal<string | null>(null);

  constructor(private http: HttpClient) {
    this.checkStoredToken();
  }

  register(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { email, password })
      .pipe(tap(response => this.handleAuthResponse(response)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(response => this.handleAuthResponse(response)));
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    this.isAuthenticated.set(true);
    this.currentUser.set(response.email);
  }

  private checkStoredToken(): void {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // TODO: Validate token with backend
      this.isAuthenticated.set(true);
    }
  }
}
```

#### Task 3.3.2: Login Component
**File:** `login.component.ts`
**Reference:** US-02
```typescript
import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        // AC: Redirect to dashboard on success
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        // AC: Show error message for invalid credentials
        this.errorMessage.set(err.error?.message || 'Invalid credentials');
        this.isLoading.set(false);
      }
    });
  }
}
```

#### Task 3.3.3: Register Component
**File:** `register.component.ts`
**Reference:** US-01
```typescript
import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9]).*$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    const { email, password } = this.registerForm.value;

    this.authService.register(email, password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Registration failed');
      }
    });
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }
}
```

#### Task 3.3.4: JWT Interceptor
**File:** `jwt.interceptor.ts`
```typescript
import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('accessToken');

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
```

#### Task 3.3.5: Auth Guard
**File:** `auth.guard.ts`
```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
```

### 3.4 User Profile Module

#### Task 3.4.1: Profile Service (Backend)
**File:** `UserProfileService.java`
**Reference:** US-03, US-04, FR-PROF-01, FR-PROF-02, FR-PROF-03
```java
@Service
public class UserProfileService {

    @Autowired
    private UserProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    public UserProfileResponse createOrUpdateProfile(Long userId, ProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        UserProfile profile = profileRepository.findByUserId(userId)
                .orElse(new UserProfile());

        profile.setUser(user);
        profile.setHeightCm(request.getHeightCm());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setGender(request.getGender());
        profile.setActivityLevel(request.getActivityLevel());
        profile.setWeightGoal(request.getWeightGoal());
        profile.setTargetWeightKg(request.getTargetWeightKg());
        profile.setUpdatedAt(LocalDateTime.now());

        profileRepository.save(profile);

        // AC: Calculate BMR and TDEE automatically
        ProfileCalculations calculations = calculateMetrics(profile, request.getCurrentWeightKg());

        UserProfileResponse response = new UserProfileResponse();
        response.setProfile(profile);
        response.setBmr(calculations.getBmr());
        response.setTdee(calculations.getTdee());
        response.setRecommendedCalories(calculations.getRecommendedCalories());

        return response;
    }

    private ProfileCalculations calculateMetrics(UserProfile profile, BigDecimal currentWeight) {
        int age = Period.between(profile.getDateOfBirth(), LocalDate.now()).getYears();

        // Mifflin-St Jeor Formula
        double bmr;
        if ("MALE".equalsIgnoreCase(profile.getGender())) {
            bmr = (10 * currentWeight.doubleValue()) +
                  (6.25 * profile.getHeightCm().doubleValue()) -
                  (5 * age) + 5;
        } else {
            bmr = (10 * currentWeight.doubleValue()) +
                  (6.25 * profile.getHeightCm().doubleValue()) -
                  (5 * age) - 161;
        }

        // TDEE calculation based on activity level
        double activityMultiplier = getActivityMultiplier(profile.getActivityLevel());
        double tdee = bmr * activityMultiplier;

        // Adjust for weight goal
        double recommendedCalories = adjustForGoal(tdee, profile.getWeightGoal());

        return new ProfileCalculations(bmr, tdee, recommendedCalories);
    }

    private double getActivityMultiplier(String activityLevel) {
        return switch (activityLevel) {
            case "SEDENTARY" -> 1.2;
            case "LIGHTLY_ACTIVE" -> 1.375;
            case "MODERATELY_ACTIVE" -> 1.55;
            case "VERY_ACTIVE" -> 1.725;
            case "EXTRA_ACTIVE" -> 1.9;
            default -> 1.2;
        };
    }

    private double adjustForGoal(double tdee, String weightGoal) {
        return switch (weightGoal) {
            case "LOSE_SLOW" -> tdee - 250;  // 0.25 kg/week
            case "LOSE_MODERATE" -> tdee - 500;  // 0.5 kg/week
            case "LOSE_FAST" -> tdee - 750;  // 0.75 kg/week
            case "GAIN_SLOW" -> tdee + 250;
            case "GAIN_MODERATE" -> tdee + 500;
            case "MAINTAIN" -> tdee;
            default -> tdee;
        };
    }
}
```

#### Task 3.4.2: Profile Controller (Backend)
**File:** `ProfileController.java`
```java
@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController {

    @Autowired
    private UserProfileService profileService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> createOrUpdateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ProfileRequest request) {

        User user = (User) userDetails;
        UserProfileResponse response = profileService.createOrUpdateProfile(user.getId(), request);

        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = (User) userDetails;
        UserProfileResponse response = profileService.getProfile(user.getId());

        return ResponseEntity.ok(response);
    }
}
```

---

## 4. Phase 2: Core Workout Tracking

### 4.1 Database Schema for Workouts

#### Task 4.1.1: Exercise Catalog Table
**File:** `V3__create_exercises_table.sql`
```sql
CREATE TABLE exercises (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    muscle_group VARCHAR(100) NOT NULL,
    equipment_type VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX idx_exercises_equipment ON exercises(equipment_type);

-- Seed data
INSERT INTO exercises (name, muscle_group, equipment_type) VALUES
('Bench Press', 'CHEST', 'BARBELL'),
('Squat', 'LEGS', 'BARBELL'),
('Deadlift', 'BACK', 'BARBELL'),
('Overhead Press', 'SHOULDERS', 'BARBELL'),
('Pull-up', 'BACK', 'BODYWEIGHT'),
('Bicep Curl', 'ARMS', 'DUMBBELL'),
('Tricep Dip', 'ARMS', 'BODYWEIGHT');
```

#### Task 4.1.2: Workouts & Sets Tables
**File:** `V4__create_workouts_table.sql`
```sql
CREATE TABLE workouts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    workout_date DATE NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    notes TEXT,
    total_volume DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_workouts_user_date ON workouts(user_id, workout_date DESC);
```

**File:** `V5__create_workout_sets_table.sql`
```sql
CREATE TABLE workout_sets (
    id BIGSERIAL PRIMARY KEY,
    workout_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    set_number INT NOT NULL,
    reps INT NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL,
    rpe INT CHECK (rpe BETWEEN 1 AND 10),
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

CREATE INDEX idx_workout_sets_workout ON workout_sets(workout_id);
CREATE INDEX idx_workout_sets_exercise ON workout_sets(exercise_id);
```

### 4.2 Backend - Workout Module

#### Task 4.2.1: Exercise Entities & Repository
**Reference:** US-05, FR-WORK-01
```java
@Entity
@Table(name = "exercises")
public class Exercise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(name = "muscle_group")
    private String muscleGroup;

    @Column(name = "equipment_type")
    private String equipmentType;

    private String description;

    // Getters, Setters
}

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    List<Exercise> findByMuscleGroup(String muscleGroup);

    List<Exercise> findByEquipmentType(String equipmentType);

    List<Exercise> findByNameContainingIgnoreCase(String name);

    @Query("SELECT e FROM Exercise e WHERE " +
           "(:muscleGroup IS NULL OR e.muscleGroup = :muscleGroup) AND " +
           "(:equipmentType IS NULL OR e.equipmentType = :equipmentType) AND " +
           "(:searchTerm IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Exercise> searchExercises(
        @Param("muscleGroup") String muscleGroup,
        @Param("equipmentType") String equipmentType,
        @Param("searchTerm") String searchTerm,
        Pageable pageable
    );
}
```

#### Task 4.2.2: Workout Service
**Reference:** US-06, US-07, US-09, FR-WORK-02, FR-WORK-03, FR-WORK-04
```java
@Service
public class WorkoutService {

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private WorkoutSetRepository setRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    public WorkoutResponse startWorkout(Long userId, WorkoutStartRequest request) {
        Workout workout = new Workout();
        workout.setUserId(userId);
        workout.setWorkoutDate(request.getDate());
        workout.setStartTime(LocalDateTime.now());

        workoutRepository.save(workout);

        return new WorkoutResponse(workout);
    }

    public WorkoutSetResponse logSet(Long workoutId, WorkoutSetRequest request) {
        // AC: Validate workout exists and belongs to user
        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new WorkoutNotFoundException("Workout not found"));

        Exercise exercise = exerciseRepository.findById(request.getExerciseId())
                .orElseThrow(() -> new ExerciseNotFoundException("Exercise not found"));

        // AC: Create workout set with reps, weight, RPE
        WorkoutSet set = new WorkoutSet();
        set.setWorkout(workout);
        set.setExercise(exercise);
        set.setSetNumber(request.getSetNumber());
        set.setReps(request.getReps());
        set.setWeightKg(request.getWeightKg());
        set.setRpe(request.getRpe());
        set.setCompletedAt(LocalDateTime.now());

        setRepository.save(set);

        // AC: Calculate volume load (reps * weight)
        double volumeLoad = request.getReps() * request.getWeightKg().doubleValue();

        return new WorkoutSetResponse(set, volumeLoad);
    }

    public WorkoutResponse finishWorkout(Long workoutId) {
        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new WorkoutNotFoundException("Workout not found"));

        workout.setEndTime(LocalDateTime.now());

        // Calculate total volume
        List<WorkoutSet> sets = setRepository.findByWorkoutId(workoutId);
        double totalVolume = sets.stream()
                .mapToDouble(s -> s.getReps() * s.getWeightKg().doubleValue())
                .sum();

        workout.setTotalVolume(BigDecimal.valueOf(totalVolume));
        workoutRepository.save(workout);

        return new WorkoutResponse(workout);
    }

    public List<WorkoutHistoryResponse> getWorkoutHistory(Long userId, LocalDate startDate, LocalDate endDate) {
        // AC: Return calendar data with workout dates
        List<Workout> workouts = workoutRepository.findByUserIdAndWorkoutDateBetween(
            userId, startDate, endDate
        );

        return workouts.stream()
                .map(this::mapToHistoryResponse)
                .collect(Collectors.toList());
    }

    public WorkoutDetailResponse getWorkoutDetail(Long workoutId) {
        // AC: Return read-only or editable workout details
        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new WorkoutNotFoundException("Workout not found"));

        List<WorkoutSet> sets = setRepository.findByWorkoutId(workoutId);

        return new WorkoutDetailResponse(workout, sets);
    }

    public List<WorkoutSet> getPreviousWorkoutData(Long userId, Long exerciseId) {
        // AC: Return "History Text" for comparison
        return setRepository.findLastWorkoutForExercise(userId, exerciseId);
    }
}
```

#### Task 4.2.3: Workout Controller
**File:** `WorkoutController.java`
```java
@RestController
@RequestMapping("/api/v1/workouts")
public class WorkoutController {

    @Autowired
    private WorkoutService workoutService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WorkoutResponse> startWorkout(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody WorkoutStartRequest request) {

        User user = (User) userDetails;
        WorkoutResponse response = workoutService.startWorkout(user.getId(), request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/sets")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WorkoutSetResponse> logSet(
            @PathVariable Long id,
            @RequestBody WorkoutSetRequest request) {

        WorkoutSetResponse response = workoutService.logSet(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/finish")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WorkoutResponse> finishWorkout(@PathVariable Long id) {
        WorkoutResponse response = workoutService.finishWorkout(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<WorkoutHistoryResponse>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        User user = (User) userDetails;
        List<WorkoutHistoryResponse> history = workoutService.getWorkoutHistory(
            user.getId(), startDate, endDate
        );

        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WorkoutDetailResponse> getWorkoutDetail(@PathVariable Long id) {
        WorkoutDetailResponse response = workoutService.getWorkoutDetail(id);
        return ResponseEntity.ok(response);
    }
}
```

### 4.3 Frontend - Workout Module

#### Task 4.3.1: Exercise List Component
**Reference:** US-05
```typescript
@Component({
  selector: 'app-exercise-list',
  standalone: true,
  templateUrl: './exercise-list.component.html'
})
export class ExerciseListComponent implements OnInit {
  exercises = signal<Exercise[]>([]);
  searchTerm = signal<string>('');
  selectedMuscleGroup = signal<string | null>(null);
  selectedEquipment = signal<string | null>(null);

  constructor(private workoutService: WorkoutService) {}

  ngOnInit() {
    this.loadExercises();
  }

  loadExercises() {
    // AC: Load with pagination/infinite scroll
    this.workoutService.searchExercises({
      searchTerm: this.searchTerm(),
      muscleGroup: this.selectedMuscleGroup(),
      equipmentType: this.selectedEquipment(),
      page: 0,
      size: 20
    }).subscribe(exercises => {
      this.exercises.set(exercises);
    });
  }

  onSearch(term: string) {
    // AC: Debounce search input
    this.searchTerm.set(term);
    this.loadExercises();
  }

  onFilterChange() {
    // AC: Combine filters
    this.loadExercises();
  }
}
```

#### Task 4.3.2: Active Workout Session Component
**Reference:** US-07, US-08
```typescript
@Component({
  selector: 'app-workout-session',
  standalone: true,
  templateUrl: './workout-session.component.html'
})
export class WorkoutSessionComponent {
  currentWorkoutId = signal<number | null>(null);
  selectedExercises = signal<Exercise[]>([]);
  currentExercise = signal<Exercise | null>(null);
  currentSetNumber = signal<number>(1);

  setForm = new FormGroup({
    reps: new FormControl<number>(0, [Validators.required, Validators.min(1)]),
    weight: new FormControl<number>(0, [Validators.required, Validators.min(0)]),
    rpe: new FormControl<number>(5, [Validators.min(1), Validators.max(10)])
  });

  previousData = signal<WorkoutSet[]>([]);
  restTimerActive = signal<boolean>(false);
  restTimeRemaining = signal<number>(0);

  constructor(private workoutService: WorkoutService) {}

  startWorkout() {
    this.workoutService.startWorkout(new Date()).subscribe(workout => {
      this.currentWorkoutId.set(workout.id);
    });
  }

  logSet() {
    if (this.setForm.invalid) return;

    const request = {
      exerciseId: this.currentExercise()!.id,
      setNumber: this.currentSetNumber(),
      reps: this.setForm.value.reps!,
      weightKg: this.setForm.value.weight!,
      rpe: this.setForm.value.rpe!
    };

    // AC: Send set data to API
    this.workoutService.logSet(this.currentWorkoutId()!, request).subscribe(response => {
      // AC: Mark set as complete with checkmark
      this.currentSetNumber.update(n => n + 1);

      // AC: Start rest timer automatically
      this.startRestTimer(120); // 2 minutes default

      // Reset form
      this.setForm.reset({ reps: 0, weight: 0, rpe: 5 });
    });
  }

  loadPreviousWorkoutData(exerciseId: number) {
    // AC: Show "History Text" from last workout
    this.workoutService.getPreviousWorkout(exerciseId).subscribe(data => {
      this.previousData.set(data);
    });
  }

  startRestTimer(seconds: number) {
    this.restTimerActive.set(true);
    this.restTimeRemaining.set(seconds);

    const interval = setInterval(() => {
      this.restTimeRemaining.update(time => {
        if (time <= 1) {
          clearInterval(interval);
          this.restTimerActive.set(false);
          // AC: Play sound/vibration when timer ends
          this.playNotificationSound();
          return 0;
        }
        return time - 1;
      });
    }, 1000);
  }

  finishWorkout() {
    this.workoutService.finishWorkout(this.currentWorkoutId()!).subscribe(() => {
      // Navigate to history or dashboard
    });
  }

  private playNotificationSound() {
    const audio = new Audio('assets/sounds/timer-complete.mp3');
    audio.play();
  }
}
```

#### Task 4.3.3: Workout History Component
**Reference:** US-09
```typescript
@Component({
  selector: 'app-workout-history',
  standalone: true,
  templateUrl: './workout-history.component.html'
})
export class WorkoutHistoryComponent implements OnInit {
  workoutCalendar = signal<WorkoutHistoryItem[]>([]);
  selectedDate = signal<Date | null>(null);
  selectedWorkoutDetail = signal<WorkoutDetail | null>(null);

  constructor(private workoutService: WorkoutService) {}

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3); // Last 3 months

    // AC: Load calendar data
    this.workoutService.getWorkoutHistory(startDate, new Date()).subscribe(history => {
      this.workoutCalendar.set(history);
    });
  }

  onDateSelect(date: Date) {
    // AC: Open workout detail on click
    const workout = this.workoutCalendar().find(w =>
      w.date.toDateString() === date.toDateString()
    );

    if (workout) {
      this.workoutService.getWorkoutDetail(workout.id).subscribe(detail => {
        this.selectedWorkoutDetail.set(detail);
      });
    }
  }

  editWorkout(workoutId: number) {
    // AC: Allow editing past workouts (CRUD)
    // Navigate to edit mode
  }
}
```

---

## 5. Phase 3: Nutrition & Metrics

### 5.1 Database Schema for Nutrition

#### Task 5.1.1: Food Items & Nutrition Logs
**File:** `V6__create_food_items_table.sql`
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_food_items_name ON food_items(name);

-- Seed common foods
INSERT INTO food_items (name, calories, protein_g, carbs_g, fat_g, serving_size) VALUES
('Chicken Breast', 165, 31, 0, 3.6, '100g'),
('Brown Rice', 111, 2.6, 23, 0.9, '100g'),
('Egg', 155, 13, 1.1, 11, '100g'),
('Banana', 89, 1.1, 23, 0.3, '100g'),
('Oats', 389, 16.9, 66, 6.9, '100g');
```

**File:** `V7__create_nutrition_logs_table.sql`
```sql
CREATE TABLE nutrition_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    food_item_id BIGINT NOT NULL,
    log_date DATE NOT NULL,
    meal_type VARCHAR(50) NOT NULL, -- BREAKFAST, LUNCH, DINNER, SNACK
    quantity_g DECIMAL(7,2) NOT NULL,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id)
);

CREATE INDEX idx_nutrition_logs_user_date ON nutrition_logs(user_id, log_date);
```

### 5.2 Daily Stats Table
**File:** `V8__create_daily_stats_table.sql`
```sql
CREATE TABLE daily_stats (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    stat_date DATE NOT NULL,
    water_ml INT DEFAULT 0,
    sleep_hours DECIMAL(3,1),
    weight_kg DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, stat_date)
);

CREATE INDEX idx_daily_stats_user_date ON daily_stats(user_id, stat_date DESC);
```

### 5.3 Backend - Nutrition Service

#### Task 5.3.1: Nutrition Service
**Reference:** US-10, US-11, FR-NUTR-01, FR-NUTR-02, FR-NUTR-03
```java
@Service
public class NutritionService {

    @Autowired
    private FoodItemRepository foodRepository;

    @Autowired
    private NutritionLogRepository nutritionLogRepository;

    @Autowired
    private UserProfileRepository profileRepository;

    public List<FoodItem> searchFoods(String searchTerm) {
        // AC: Search food database
        return foodRepository.findByNameContainingIgnoreCase(searchTerm);
    }

    public NutritionLogResponse logFood(Long userId, NutritionLogRequest request) {
        // AC: Validate meal type
        if (!isValidMealType(request.getMealType())) {
            throw new IllegalArgumentException("Invalid meal type");
        }

        FoodItem food = foodRepository.findById(request.getFoodItemId())
                .orElseThrow(() -> new FoodNotFoundException("Food not found"));

        // AC: Calculate macros based on quantity
        double multiplier = request.getQuantityG().doubleValue() / 100.0;

        NutritionLog log = new NutritionLog();
        log.setUserId(userId);
        log.setFoodItem(food);
        log.setLogDate(request.getDate());
        log.setMealType(request.getMealType());
        log.setQuantityG(request.getQuantityG());
        log.setLoggedAt(LocalDateTime.now());

        nutritionLogRepository.save(log);

        // Calculate actual macros
        NutritionLogResponse response = new NutritionLogResponse();
        response.setLog(log);
        response.setCalculatedCalories(food.getCalories().doubleValue() * multiplier);
        response.setCalculatedProtein(food.getProteinG().doubleValue() * multiplier);
        response.setCalculatedCarbs(food.getCarbsG().doubleValue() * multiplier);
        response.setCalculatedFat(food.getFatG().doubleValue() * multiplier);

        return response;
    }

    public DailyNutritionSummary getDailySummary(Long userId, LocalDate date) {
        // Get user's target calories from profile
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found"));

        double targetCalories = calculateTargetCalories(profile);
        MacroTargets targets = calculateMacroTargets(targetCalories);

        // Get all logs for the day
        List<NutritionLog> logs = nutritionLogRepository.findByUserIdAndLogDate(userId, date);

        // AC: Calculate totals
        double totalCalories = 0;
        double totalProtein = 0;
        double totalCarbs = 0;
        double totalFat = 0;

        for (NutritionLog log : logs) {
            double multiplier = log.getQuantityG().doubleValue() / 100.0;
            FoodItem food = log.getFoodItem();

            totalCalories += food.getCalories().doubleValue() * multiplier;
            totalProtein += food.getProteinG().doubleValue() * multiplier;
            totalCarbs += food.getCarbsG().doubleValue() * multiplier;
            totalFat += food.getFatG().doubleValue() * multiplier;
        }

        DailyNutritionSummary summary = new DailyNutritionSummary();
        summary.setTargetCalories(targetCalories);
        summary.setConsumedCalories(totalCalories);
        summary.setTargetProtein(targets.getProtein());
        summary.setConsumedProtein(totalProtein);
        summary.setTargetCarbs(targets.getCarbs());
        summary.setConsumedCarbs(totalCarbs);
        summary.setTargetFat(targets.getFat());
        summary.setConsumedFat(totalFat);
        summary.setLogs(logs);

        return summary;
    }

    private boolean isValidMealType(String mealType) {
        return Arrays.asList("BREAKFAST", "LUNCH", "DINNER", "SNACK").contains(mealType);
    }

    private MacroTargets calculateMacroTargets(double calories) {
        // Standard macro split: 30% protein, 40% carbs, 30% fat
        double proteinCals = calories * 0.30;
        double carbsCals = calories * 0.40;
        double fatCals = calories * 0.30;

        return new MacroTargets(
            proteinCals / 4.0,  // 4 cal/g
            carbsCals / 4.0,    // 4 cal/g
            fatCals / 9.0       // 9 cal/g
        );
    }
}
```

### 5.4 Backend - Metrics Service

#### Task 5.4.1: Metrics Service
**Reference:** US-12, US-13, FR-META-01, FR-META-02, FR-META-04
```java
@Service
public class MetricsService {

    @Autowired
    private DailyStatsRepository statsRepository;

    public DailyStats addWater(Long userId, int milliliters) {
        LocalDate today = LocalDate.now();

        // AC: Optimistic update - get or create today's stats
        DailyStats stats = statsRepository.findByUserIdAndStatDate(userId, today)
                .orElse(new DailyStats(userId, today));

        // AC: Increment water counter
        stats.setWaterMl(stats.getWaterMl() + milliliters);
        stats.setUpdatedAt(LocalDateTime.now());

        return statsRepository.save(stats);
    }

    public DailyStats logWeight(Long userId, BigDecimal weightKg, LocalDate date) {
        // AC: Accept weight with one decimal place
        DailyStats stats = statsRepository.findByUserIdAndStatDate(userId, date)
                .orElse(new DailyStats(userId, date));

        stats.setWeightKg(weightKg);
        stats.setUpdatedAt(LocalDateTime.now());

        return statsRepository.save(stats);
    }

    public WeightTrendResponse getWeightTrend(Long userId, LocalDate startDate, LocalDate endDate) {
        List<DailyStats> stats = statsRepository.findByUserIdAndStatDateBetweenOrderByStatDateAsc(
            userId, startDate, endDate
        );

        // AC: Calculate trend line
        List<WeightDataPoint> dataPoints = stats.stream()
                .filter(s -> s.getWeightKg() != null)
                .map(s -> new WeightDataPoint(s.getStatDate(), s.getWeightKg()))
                .collect(Collectors.toList());

        // Simple moving average for trend
        List<WeightDataPoint> trendLine = calculateMovingAverage(dataPoints, 7);

        WeightTrendResponse response = new WeightTrendResponse();
        response.setDataPoints(dataPoints);
        response.setTrendLine(trendLine);

        return response;
    }

    public DashboardSummaryResponse getDashboardSummary(Long userId) {
        LocalDate today = LocalDate.now();

        // Today's metrics
        DailyStats todayStats = statsRepository.findByUserIdAndStatDate(userId, today)
                .orElse(new DailyStats(userId, today));

        // Recent workout count
        long workoutsThisWeek = workoutRepository.countByUserIdAndWorkoutDateAfter(
            userId, today.minusDays(7)
        );

        // Today's nutrition
        DailyNutritionSummary nutrition = nutritionService.getDailySummary(userId, today);

        DashboardSummaryResponse summary = new DashboardSummaryResponse();
        summary.setWaterMl(todayStats.getWaterMl());
        summary.setWorkoutsThisWeek(workoutsThisWeek);
        summary.setCaloriesConsumed(nutrition.getConsumedCalories());
        summary.setCaloriesTarget(nutrition.getTargetCalories());
        summary.setCurrentWeight(todayStats.getWeightKg());

        return summary;
    }

    private List<WeightDataPoint> calculateMovingAverage(List<WeightDataPoint> data, int window) {
        // Implementation of moving average calculation
        // ...
        return new ArrayList<>();
    }
}
```

### 5.5 Frontend - Nutrition Components

#### Task 5.5.1: Food Search Component
**Reference:** US-10
```typescript
@Component({
  selector: 'app-food-search',
  standalone: true,
  templateUrl: './food-search.component.html'
})
export class FoodSearchComponent {
  searchResults = signal<FoodItem[]>([]);
  selectedMealType = signal<string>('BREAKFAST');

  searchForm = new FormGroup({
    searchTerm: new FormControl(''),
    quantity: new FormControl<number>(100, Validators.min(1))
  });

  constructor(private nutritionService: NutritionService) {}

  onSearch() {
    const term = this.searchForm.value.searchTerm;
    if (!term) return;

    // AC: Search food database
    this.nutritionService.searchFoods(term).subscribe(results => {
      this.searchResults.set(results);
    });
  }

  selectFood(food: FoodItem) {
    // AC: Show calculated macros before adding
    const quantity = this.searchForm.value.quantity!;
    const multiplier = quantity / 100;

    const preview = {
      calories: food.calories * multiplier,
      protein: food.proteinG * multiplier,
      carbs: food.carbsG * multiplier,
      fat: food.fatG * multiplier
    };

    // Show preview, then log on confirm
    this.logFood(food, quantity);
  }

  logFood(food: FoodItem, quantity: number) {
    const request = {
      foodItemId: food.id,
      date: new Date(),
      mealType: this.selectedMealType(),
      quantityG: quantity
    };

    this.nutritionService.logFood(request).subscribe(() => {
      // Update macro tracker in real-time
    });
  }
}
```

#### Task 5.5.2: Macro Tracker Component
**Reference:** US-11
```typescript
@Component({
  selector: 'app-macro-tracker',
  standalone: true,
  templateUrl: './macro-tracker.component.html'
})
export class MacroTrackerComponent implements OnInit {
  dailySummary = signal<DailyNutritionSummary | null>(null);

  constructor(private nutritionService: NutritionService) {}

  ngOnInit() {
    this.loadDailySummary();
  }

  loadDailySummary() {
    this.nutritionService.getDailySummary(new Date()).subscribe(summary => {
      this.dailySummary.set(summary);
    });
  }

  getProteinPercentage(): number {
    const summary = this.dailySummary();
    if (!summary) return 0;
    return (summary.consumedProtein / summary.targetProtein) * 100;
  }

  getCarbsPercentage(): number {
    const summary = this.dailySummary();
    if (!summary) return 0;
    return (summary.consumedCarbs / summary.targetCarbs) * 100;
  }

  getFatPercentage(): number {
    const summary = this.dailySummary();
    if (!summary) return 0;
    return (summary.consumedFat / summary.targetFat) * 100;
  }

  isOverTarget(percentage: number): boolean {
    // AC: Color bar red/orange if over target
    return percentage > 100;
  }
}
```

### 5.6 Frontend - Metrics Components

#### Task 5.6.1: Water Tracker Component
**Reference:** US-12
```typescript
@Component({
  selector: 'app-water-tracker',
  standalone: true,
  templateUrl: './water-tracker.component.html'
})
export class WaterTrackerComponent implements OnInit {
  waterMl = signal<number>(0);
  targetMl = 2500; // Default target

  constructor(private metricsService: MetricsService) {}

  ngOnInit() {
    this.loadTodayWater();
  }

  loadTodayWater() {
    this.metricsService.getTodayStats().subscribe(stats => {
      this.waterMl.set(stats.waterMl);
    });
  }

  addWater(amount: number) {
    // AC: Optimistic UI update
    this.waterMl.update(current => current + amount);

    this.metricsService.addWater(amount).subscribe({
      error: () => {
        // Rollback on error
        this.waterMl.update(current => current - amount);
      }
    });
  }

  getPercentage(): number {
    return (this.waterMl() / this.targetMl) * 100;
  }
}
```

#### Task 5.6.2: Weight Chart Component
**Reference:** US-13
```typescript
@Component({
  selector: 'app-weight-chart',
  standalone: true,
  templateUrl: './weight-chart.component.html'
})
export class WeightChartComponent implements OnInit {
  weightData = signal<WeightDataPoint[]>([]);
  trendLine = signal<WeightDataPoint[]>([]);
  selectedPeriod = signal<'week' | 'month' | 'quarter'>('month');

  constructor(private metricsService: MetricsService) {}

  ngOnInit() {
    this.loadWeightData();
  }

  loadWeightData() {
    const period = this.selectedPeriod();
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
    }

    // AC: Load weight trend with trend line
    this.metricsService.getWeightTrend(startDate, endDate).subscribe(trend => {
      this.weightData.set(trend.dataPoints);
      this.trendLine.set(trend.trendLine);
    });
  }

  logWeight() {
    // Open dialog to log new weight
  }
}
```

---

## 6. Phase 4: Smart Features & PWA

### 6.1 Progressive Overload Recommendations

#### Task 6.1.1: Progressive Overload Service
**Reference:** US-15, FR-AI-02
```java
@Service
public class ProgressiveOverloadService {

    @Autowired
    private WorkoutSetRepository setRepository;

    public OverloadSuggestion checkForOverloadOpportunity(Long userId, Long exerciseId,
                                                          int currentReps, double currentWeight,
                                                          int currentRpe) {
        // Get last workout data for same exercise
        List<WorkoutSet> previousSets = setRepository.findLastWorkoutForExercise(userId, exerciseId);

        if (previousSets.isEmpty()) {
            return null; // No previous data
        }

        // AC: Check if same reps and weight with RPE < 7
        boolean samePerformance = previousSets.stream()
                .anyMatch(set ->
                    set.getReps() == currentReps &&
                    Math.abs(set.getWeightKg().doubleValue() - currentWeight) < 0.1
                );

        if (samePerformance && currentRpe < 7) {
            // AC: Suggest weight increase
            double suggestedWeight = currentWeight + 2.5; // +2.5kg

            OverloadSuggestion suggestion = new OverloadSuggestion();
            suggestion.setMessage("Opitай +" + suggestedWeight + "kg днес?");
            suggestion.setSuggestedWeight(BigDecimal.valueOf(suggestedWeight));
            suggestion.setReason("Последния път беше с RPE " + currentRpe + " - време е за прогрес!");

            return suggestion;
        }

        return null;
    }
}
```

### 6.2 Inactivity Reminder System

#### Task 6.2.1: Scheduled Reminder Job
**Reference:** US-17, FR-AI-01
```java
@Component
public class InactivityReminderJob {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private EmailService emailService;

    @Scheduled(cron = "0 0 10 * * *") // Every day at 10 AM
    public void checkInactiveUsers() {
        LocalDate thresholdDate = LocalDate.now().minusDays(3);

        List<User> allUsers = userRepository.findAll();

        for (User user : allUsers) {
            // AC: Check if last workout > 3 days ago
            Optional<Workout> lastWorkout = workoutRepository.findTopByUserIdOrderByWorkoutDateDesc(user.getId());

            if (lastWorkout.isEmpty() || lastWorkout.get().getWorkoutDate().isBefore(thresholdDate)) {
                // Check if already sent reminder recently
                if (!wasReminderSentRecently(user.getId())) {
                    // AC: Send email or push notification
                    emailService.sendInactivityReminder(user.getEmail());

                    // Log reminder sent
                    saveReminderLog(user.getId());
                }
            }
        }
    }

    private boolean wasReminderSentRecently(Long userId) {
        // AC: Limit to 1 reminder per 3 days
        // Check reminder_logs table
        return false; // Simplified
    }

    private void saveReminderLog(Long userId) {
        // Save to reminder_logs table
    }
}
```

### 6.3 PWA Configuration

#### Task 6.3.1: Service Worker Setup
**Reference:** US-16, NFR Offline Capability
**File:** `ngsw-config.json`
```json
{
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/*.css",
          "/*.js"
        ]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/assets/**",
          "/*.(png|jpg|jpeg|svg|gif)"
        ]
      }
    }
  ],
  "dataGroups": [
    {
      "name": "api-cache",
      "urls": [
        "/api/v1/exercises",
        "/api/v1/profile"
      ],
      "cacheConfig": {
        "maxSize": 100,
        "maxAge": "1h",
        "strategy": "freshness"
      }
    },
    {
      "name": "api-performance",
      "urls": [
        "/api/v1/workouts/**",
        "/api/v1/nutrition/**"
      ],
      "cacheConfig": {
        "maxSize": 50,
        "maxAge": "6h",
        "strategy": "performance"
      }
    }
  ]
}
```

#### Task 6.3.2: Offline Storage Service
**File:** `offline-storage.service.ts`
```typescript
@Injectable({ providedIn: 'root' })
export class OfflineStorageService {
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private initDB() {
    const request = indexedDB.open('FitTrackDB', 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // AC: Create object stores for offline data
      if (!db.objectStoreNames.contains('workoutSets')) {
        db.createObjectStore('workoutSets', { keyPath: 'tempId', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('nutritionLogs')) {
        db.createObjectStore('nutritionLogs', { keyPath: 'tempId', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
    };
  }

  async saveWorkoutSetOffline(setData: any): Promise<void> {
    // AC: Save to IndexedDB when offline
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['workoutSets'], 'readwrite');
      const store = transaction.objectStore('workoutSets');

      const request = store.add({
        ...setData,
        timestamp: new Date(),
        synced: false
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async syncOfflineData(): Promise<void> {
    // AC: Sync with backend when connection restored
    if (!navigator.onLine) return;

    const workoutSets = await this.getUnsyncedWorkoutSets();

    for (const set of workoutSets) {
      try {
        await this.workoutService.logSet(set).toPromise();
        await this.markAsSynced('workoutSets', set.tempId);
      } catch (error) {
        console.error('Sync failed for set:', set, error);
      }
    }
  }

  private async getUnsyncedWorkoutSets(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['workoutSets'], 'readonly');
      const store = transaction.objectStore('workoutSets');
      const request = store.getAll();

      request.onsuccess = () => {
        const sets = request.result.filter((s: any) => !s.synced);
        resolve(sets);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async markAsSynced(storeName: string, id: number): Promise<void> {
    // Mark item as synced or delete it
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
```

#### Task 6.3.3: Network Status Monitor
**File:** `network-status.service.ts`
```typescript
@Injectable({ providedIn: 'root' })
export class NetworkStatusService {
  isOnline = signal<boolean>(navigator.onLine);

  constructor(private offlineStorage: OfflineStorageService) {
    this.setupListeners();
  }

  private setupListeners() {
    window.addEventListener('online', () => {
      this.isOnline.set(true);

      // AC: Auto-sync when connection restored
      this.offlineStorage.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline.set(false);
    });
  }
}
```

---

## 7. Testing Strategy

### 7.1 Backend Testing

#### Unit Tests
- **Controllers:** Mock services, test request/response handling
- **Services:** Test business logic, calculations (BMR, TDEE, Volume Load)
- **Repositories:** Use H2 in-memory database for integration tests

**Example Test:** `AuthServiceTest.java`
```java
@SpringBootTest
public class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @MockBean
    private UserRepository userRepository;

    @Test
    public void testRegister_ValidInput_Success() {
        RegisterRequest request = new RegisterRequest("test@example.com", "Password123");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(new User());

        AuthResponse response = authService.register(request);

        assertNotNull(response.getAccessToken());
        assertNotNull(response.getRefreshToken());
    }

    @Test
    public void testRegister_DuplicateEmail_ThrowsException() {
        RegisterRequest request = new RegisterRequest("test@example.com", "Password123");

        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(UserAlreadyExistsException.class, () -> {
            authService.register(request);
        });
    }
}
```

#### Integration Tests
- Test full API flows with TestRestTemplate
- Verify database transactions
- Test security filters and JWT validation

### 7.2 Frontend Testing

#### Unit Tests (Jasmine/Karma)
- Component logic testing
- Service testing with HttpClientTestingModule
- Form validation testing

**Example Test:** `login.component.spec.ts`
```typescript
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);

    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call authService.login on form submit', () => {
    authService.login.and.returnValue(of({
      accessToken: 'token',
      refreshToken: 'refresh',
      email: 'test@example.com'
    }));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'Password123'
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'Password123');
  });
});
```

#### E2E Tests (Playwright/Cypress)
- User journey testing
- Critical paths: Register → Login → Log Workout → View History

### 7.3 Test Coverage Goals
- Backend: 80% code coverage minimum
- Frontend: 70% code coverage minimum
- All User Stories must have corresponding test cases

---

## 8. Deployment Strategy

### 8.1 Docker Configuration

#### Backend Dockerfile
**File:** `fittrack-backend/Dockerfile`
```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/fittrack-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### Frontend Dockerfile
**File:** `fittrack-frontend/Dockerfile`
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=production

FROM nginx:1.25-alpine
COPY --from=build /app/dist/fittrack-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 8.2 Environment Configuration

#### Backend `application.yml`
```yaml
spring:
  profiles:
    active: ${SPRING_PROFILE:dev}
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/fittrack}
    username: ${DB_USER:fittrack_user}
    password: ${DB_PASSWORD:fittrack_pass}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
  flyway:
    enabled: true
    locations: classpath:db/migration

jwt:
  secret: ${JWT_SECRET:your-256-bit-secret-key-change-in-production}
  access-token-expiration: 900000 # 15 minutes
  refresh-token-expiration: 604800000 # 7 days

logging:
  level:
    com.fittrack: INFO
```

#### Frontend `environment.prod.ts`
```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.fittrack.com/api/v1',
  enableServiceWorker: true
};
```

### 8.3 CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      - name: Run tests
        run: |
          cd fittrack-backend
          mvn test
      - name: Build
        run: mvn clean package -DskipTests

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd fittrack-frontend
          npm ci
      - name: Run tests
        run: npm test -- --watch=false --browsers=ChromeHeadless
      - name: Build
        run: npm run build -- --configuration=production

  deploy:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Build and push Docker images
        run: |
          docker-compose build
          docker-compose push
      - name: Deploy to production
        run: |
          # Deploy commands
```

---

## 9. Timeline & Milestones

### Phase 1: Foundation & Authentication (Weeks 1-2)
- **Week 1:**
  - Project setup and structure
  - Docker configuration
  - Database schema creation (Users, Profiles)
  - Backend authentication implementation
- **Week 2:**
  - Frontend authentication components
  - JWT interceptor and guards
  - User profile module
  - BMR/TDEE calculations

**Deliverables:**
- Users can register, login, and set up profiles
- BMR and TDEE automatically calculated

### Phase 2: Core Workout Tracking (Weeks 3-5)
- **Week 3:**
  - Exercise catalog implementation
  - Database schema for workouts
  - Backend workout APIs
- **Week 4:**
  - Active workout session UI
  - Set logging functionality
  - Rest timer component
- **Week 5:**
  - Workout history and calendar
  - Edit past workouts
  - Progressive overload suggestions

**Deliverables:**
- Users can log complete workouts with sets/reps/weight
- Workout history viewable in calendar format
- Previous workout data displayed for comparison

### Phase 3: Nutrition & Metrics (Weeks 6-7)
- **Week 6:**
  - Food database setup
  - Nutrition logging backend
  - Daily stats tracking
- **Week 7:**
  - Food search and logging UI
  - Macro tracker dashboard
  - Water and weight tracking components
  - Weight trend charts

**Deliverables:**
- Users can log food and track macros
- Real-time macro progress bars
- Water tracking with quick-add buttons
- Weight chart with trend line

### Phase 4: Smart Features & PWA (Weeks 8-9)
- **Week 8:**
  - Progressive overload logic
  - Inactivity reminder job
  - Service Worker configuration
- **Week 9:**
  - Offline storage implementation
  - Auto-sync functionality
  - PWA manifest and icons
  - Final polish and bug fixes

**Deliverables:**
- Progressive overload suggestions working
- Email reminders for inactive users
- Full offline capability
- PWA installable on mobile devices

### Testing & Deployment (Week 10)
- Comprehensive testing (Unit + Integration + E2E)
- Performance optimization
- Security audit
- Production deployment

---

## 10. Success Criteria

### Functional Requirements Met
- ✅ All 17 User Stories implemented
- ✅ All Acceptance Criteria passed
- ✅ API endpoints functional and documented

### Non-Functional Requirements Met
- ✅ API response time < 200ms for 95% of requests
- ✅ Passwords stored as BCrypt hashes
- ✅ JWT authentication working correctly
- ✅ Offline mode functional with auto-sync
- ✅ Mobile-friendly UI (44px minimum touch targets)

### Quality Metrics
- ✅ Backend test coverage ≥ 80%
- ✅ Frontend test coverage ≥ 70%
- ✅ Zero critical security vulnerabilities
- ✅ Lighthouse PWA score ≥ 90

---

## Appendix A: Quick Reference Commands

### Development Setup
```bash
# Start PostgreSQL
docker-compose up postgres

# Run Backend (Dev Mode)
cd fittrack-backend
mvn spring-boot:run

# Run Frontend (Dev Mode)
cd fittrack-frontend
npm start

# Run All Services
docker-compose up --build
```

### Database Migrations
```bash
# Create new migration
cd fittrack-backend/src/main/resources/db/migration
touch V9__description.sql

# Run migrations
mvn flyway:migrate
```

### Testing
```bash
# Backend Tests
mvn test
mvn verify

# Frontend Tests
npm test
npm run e2e

# Coverage Reports
mvn jacoco:report
npm run test:coverage
```

---

## Appendix B: Additional Resources

### Documentation Links
- Spring Boot: https://spring.io/projects/spring-boot
- Angular: https://angular.dev
- PostgreSQL: https://www.postgresql.org/docs/
- JWT: https://jwt.io/
- PWA: https://web.dev/progressive-web-apps/

### Key Libraries & Dependencies
**Backend:**
- spring-boot-starter-web
- spring-boot-starter-data-jpa
- spring-boot-starter-security
- jjwt (JWT library)
- flyway-core (Database migrations)
- lombok (Reduce boilerplate)

**Frontend:**
- @angular/core
- @angular/common/http
- @angular/forms
- @angular/router
- @angular/service-worker
- chart.js (For weight charts)

---

**End of Implementation Plan**
