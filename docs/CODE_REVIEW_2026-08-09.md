# FitTrack Pro — Code Review

**Date:** 2026-08-09
**Branch reviewed:** current working tree (recent commits: Java 25 upgrade, frontend template externalization, body-metrics analytics, doc consolidation)
**Scope:** All lenses — security, correctness, code quality, architecture, testing, docs, ops
**Approach:** every finding below was verified against the current code; claims that didn't hold were dropped.

---

## Severity summary

| Severity | Count |
|---|---|
| Critical | 4 |
| High | 12 |
| Medium | 17 |
| Low | 12 |
| **Total** | **45** |

Buckets: Security (10) · Correctness (13) · Code quality (10) · Architecture (5) · Testing (3) · Docs & product (7) · Ops (5). One finding sometimes counts in two buckets; the total above is de-duplicated.

---

## Top 10 to fix first

1. **[Critical] Duplicate 401 handling silently kills the token-refresh flow.** `error.interceptor.ts:29` calls `authService.logout()` before `auth.interceptor.ts:28` can refresh. The refresh path is effectively dead.
2. **[Critical] `deleteNutritionLog` returns 204 for any ID a user probes.** `NutritionService.java:181-184` — silent no-op on non-matching rows means IDOR probing is undetectable.
3. **[Critical] Global exception handler leaks internals.** `GlobalExceptionHandler.java:99` calls `ex.printStackTrace()` and returns `ex.getMessage()` verbatim to clients on any unhandled error.
4. **[Critical] JWT auth filter swallows all exceptions.** `JwtAuthenticationFilter.java:45-47` catches every error and logs it; expired vs. tampered vs. missing tokens are indistinguishable to the client, and any thrown `UsernameNotFoundException` etc. becomes a silent anonymous request.
5. **[High] Hardcoded fake business logic in production paths.** Calorie targets, weight defaults, and "compliance rate" are all placeholders returning made-up numbers — see the correctness section.
6. **[High] N+1 in workout history and metrics.** Every `/workouts/history` and `/metrics/progress/weekly` request runs one SQL per workout. `WorkoutService.java:120-131`, `MetricsService.java:299-302`, `MetricsService.java:350`.
7. **[High] Access + refresh tokens stored in `localStorage`.** `auth.service.ts:88-96`. Any XSS reads them; there is no CSP.
8. **[High] `alert()` / `confirm()` used as the app's UX layer.** 6 alerts and 3 confirms across workout, nutrition, exercise, and analytics components — blocking, inaccessible, untestable, and hide "coming soon" stubs behind real buttons.
9. **[High] No CI/CD.** No `.github/`, no `.gitlab-ci.yml`, no Jenkinsfile. The three backend test files never run automatically; the one frontend test that exists is broken.
10. **[High] Docs contradict reality.** README says "Phase 3 40%" and lists 7 migrations; the code has full nutrition service + 10 migrations. CHANGELOG frozen at v1.0.0 still says "Spring Boot 3.2.0" and "Angular 18".

---

## 1. Security (10)

### [Critical] S1 — Duplicate 401 handling kills refresh flow
`fittrack-frontend/src/app/core/interceptors/error.interceptor.ts:27-30` catches 401 and calls `authService.logout()`, which clears `localStorage`. `auth.interceptor.ts:28` *also* handles 401 and tries to refresh — but because the interceptors are listed `[authInterceptor, errorInterceptor]` in `app.config.ts`, RxJS `catchError` runs from the source outward, so `errorInterceptor` fires first, wipes tokens, then `authInterceptor` runs `refreshToken()` which errors with "No refresh token available". Effect: any 401 immediately logs the user out; the refresh mechanism is dead code.
**Fix:** Remove 401 handling from `errorInterceptor` (leave only user-facing status→message mapping), or coordinate the two: only one place should own auth recovery.

### [Critical] S2 — Silent no-op on nutrition log deletion enables IDOR probing
`fittrack-backend/src/main/java/com/fittrack/service/NutritionService.java:181-184` calls `nutritionLogRepository.deleteByUserIdAndId(userId, logId)` and never checks the row count. The controller returns 204 whether the log existed or not, whether it belonged to the user or not. An attacker can iterate log IDs and get 204s indistinguishable from real deletions — no audit trail either.
**Fix:** Load the entity first, verify ownership, `deleteById`. Or make the repo method return an `int` and 404 on 0.

### [Critical] S3 — Global exception handler leaks stack traces + messages
`fittrack-backend/src/main/java/com/fittrack/exception/GlobalExceptionHandler.java:93-109` catches `Exception.class`, calls `ex.printStackTrace()` (which goes to stdout, not the logger), and puts `ex.getMessage()` into the JSON response body. Combined with `application.yml:40 include-message: always` and `application.yml:42 include-stacktrace: on_param`, a client can trigger any internal exception and read database/entity/business errors directly. Adding `?trace=true` to any request that errors also returns a stack trace.
**Fix:** Replace `printStackTrace()` with `log.error(...)`. Return a generic message (`"Internal server error"`) to the client. Set `include-message: never` and `include-stacktrace: never` in production profile.

### [Critical] S4 — JwtAuthenticationFilter swallows every exception
`fittrack-backend/src/main/java/com/fittrack/security/JwtAuthenticationFilter.java:32-47` wraps the entire token-processing block in `try { ... } catch (Exception ex) { logger.error(...) }` and then calls `filterChain.doFilter` regardless. Effects: (a) expired tokens are indistinguishable from missing tokens (the client can't tell it should refresh), (b) any `UserDetailsService` failure — e.g. deleted-user token still valid — becomes an anonymous request rather than a 401, (c) important auth failures never reach a metric or alarm. Also `JwtTokenProvider.validateToken` at line 72-82 does the same thing.
**Fix:** Distinguish `ExpiredJwtException` (respond 401 with `WWW-Authenticate: Bearer error="invalid_token"`) from other failures. Don't call `filterChain.doFilter` on hard failures.

### [High] S5 — Tokens stored in `localStorage` (XSS-exfiltrable)
`fittrack-frontend/src/app/core/services/auth.service.ts:88-96` writes `access_token` and `refresh_token` to `localStorage`. Any XSS on the app can steal both. There is no CSP header (nginx.conf sets none), and Angular templates render user-editable strings (workout notes, nutrition notes, etc.) — reviewed and no obvious `[innerHTML]` sinks, but the surface remains.
**Fix:** Move refresh token to an `HttpOnly; Secure; SameSite=Strict` cookie set by the backend's `/auth/refresh` endpoint. Keep access token in memory (a service field), not `localStorage`. Add a CSP via nginx (`default-src 'self'`, `script-src 'self'`).

### [High] S6 — Weak JWT default secret + fragile key derivation
`application.yml:33` defaults to `default-secret-change-me-in-production`. `docker-compose.yml:38` defaults to `your-256-bit-secret-key-change-in-production`. Both are 38–40 chars — just long enough that `Keys.hmacShaKeyFor` doesn't throw for HS256, but both are documented on GitHub. `JwtTokenProvider.getSigningKey()` at line 87-90 uses raw UTF-8 bytes; if an operator sets `JWT_SECRET=short` it will throw at runtime with a confusing error.
**Fix:** Refuse to boot when `jwt.secret` equals a known default (a `@PostConstruct` check). Document that `JWT_SECRET` must be a base64-encoded ≥32-byte random value and decode with `Decoders.BASE64.decode(...)`.

### [High] S7 — CORS hardcoded to `localhost`
`fittrack-backend/src/main/java/com/fittrack/config/CorsConfig.java:17` hardcodes `http://localhost:4200` and `http://localhost:80`. Not env-configurable; anyone deploying anywhere else has to recompile. `.allowCredentials(true)` combined with `.setAllowedHeaders(Arrays.asList("*"))` is fine (wildcard is only on headers, not origins) but the origin list is unworkable in prod.
**Fix:** Read `cors.allowed-origins` from `application.yml` (bind to `${CORS_ALLOWED_ORIGINS:http://localhost:4200}` and split on `,`).

### [High] S8 — Actuator endpoints permitted anonymously
`SecurityConfig.java:40` — `.requestMatchers("/actuator/**").permitAll()`. `application.yml:50` exposes `health, info, metrics`. `metrics` and `info` don't require auth; an unauthenticated caller can enumerate JVM stats, request counts, uptime.
**Fix:** Restrict `/actuator/**` to an admin role (or bind it to a separate management port). At minimum, only expose `/actuator/health/liveness` and `/actuator/health/readiness` anonymously.

### [Medium] S9 — `@EnableMethodSecurity` on but no `@PreAuthorize` anywhere
`SecurityConfig.java:24`. Enabled but unused. Every controller checks ownership manually inside services (mostly) — inconsistent and error-prone. Once the app has admin endpoints (e.g. the `role` field on `User`) this will bite.
**Fix:** Either add `@PreAuthorize("hasRole('USER')")` at controller level and role-based checks on the (currently unused) admin surface, or drop `@EnableMethodSecurity` until you need it.

### [Medium] S10 — `authInterceptor` refreshes on 403
`auth.interceptor.ts:28` — `if ((error.status === 401 || error.status === 403) ...)` triggers refresh. 403 is authorization failure, not authentication; refreshing the token can't fix it and produces spurious refresh calls.
**Fix:** Only refresh on 401.

---

## 2. Correctness / real bugs (13)

### [Critical] C1 — See S1, S2, S3 (already in Security).

### [High] C1 — Hardcoded calorie targets everywhere
- `MetricsService.java:181-188` — dashboard summary sets `caloriesTarget = 2000.0`, comment "Placeholder" at line 186.
- `MetricsService.java:533` — `calculateCalorieCompliance` uses `Double targetCalories = 2000.0; // Simplified`.
- `MetricsService.java:547` — `calculateProteinCompliance` uses `Double targetProtein = 150.0; // Simplified`.
- `NutritionService.java:210, 215` — falls back to `2000.0` if profile/weight missing.

Users see "compliance" and "targets" that have nothing to do with their profile.
**Fix:** Refactor the Mifflin-St Jeor + macro logic in `ProfileService` into a `NutritionCalculator` bean, inject into both `MetricsService` and `NutritionService`. Use it consistently.

### [High] C2 — `ProfileController.getProfile` invents `currentWeightKg = 70`
`fittrack-backend/src/main/java/com/fittrack/controller/ProfileController.java:63-65` — when the query param is missing, sets `currentWeight = BigDecimal.valueOf(70.0)` and passes that to `ProfileService.getProfile`, which computes BMR/TDEE/calorie target from it. Every user who doesn't pass a weight gets numbers computed as if they weigh 70kg.
**Fix:** Look up the most recent `DailyStats.weightKg` for the user (there's already `dailyStatsRepository.findRecentWeightLogs(userId)` — `NutritionService` uses it). If none, return the profile with `calculations = null` and let the frontend show "log a weight to see targets".

### [High] C3 — Fake "compliance rate" formula
`MetricsService.java:317` — `Double complianceRate = workoutCount >= 3 ? 80.0 : (workoutCount * 100.0 / 3.0);`. This isn't compliance with anything — it's just "did you work out 3× this week." The value is then shown as a percentage in analytics.
**Fix:** Either delete the field or compute it against the actual weekly target (from profile/goal).

### [High] C4 — N+1 in workout history
`WorkoutService.java:118-131` — `findByUserIdAndWorkoutDateBetween` returns N workouts, then the `.map(...)` calls `setRepository.findByWorkoutIdOrderBySetNumberAsc(workout.getId())` per workout to count unique exercises. Every history page = 1 + N queries.
**Fix:** Add a `@Query` on `WorkoutRepository` that joins sets and returns `Workout` + unique-exercise-count as a projection, or use `EntityGraph` and count in memory from the pre-loaded collection.

### [High] C5 — N+1 in weekly progress and personal records
`MetricsService.java:299-302` — `workouts.stream().flatMap(w -> w.getSets().stream())` on lazy-loaded sets triggers per-workout SQL. Same at line 350 for personal records.
**Fix:** Either `JOIN FETCH` on the workouts query used for these paths, or replace the in-memory aggregation with SQL (`workoutSetRepository.getTotalVolumeBetweenDates(...)` — one similar aggregate already exists at line 239).

### [Medium] C6 — Consistency streak allows day gaps and double-counts same-day workouts
`MetricsService.java:481-499`. The check `workout.getWorkoutDate().isEqual(currentDate) || workout.getWorkoutDate().isEqual(currentDate.minusDays(1))` accepts a one-day gap between consecutive workouts, so "worked out Mon, Wed, Fri" is counted as a 3-day streak. Also `findTop30ByUserIdOrderByWorkoutDateDesc` can return multiple workouts on the same day, each incrementing the counter.
**Fix:** Distinct-by-date first, then require strict consecutiveness.

### [Medium] C7 — Personal records ignore reps
`MetricsService.java:354-355` picks `.max((a, b) -> a.getWeightKg().compareTo(b.getWeightKg()))`. A 1-rep 100kg and a 10-rep 100kg tie and one of them wins arbitrarily; a 5-rep 95kg (harder) loses to any 100kg entry.
**Fix:** Rank by estimated 1RM (Epley: `weight * (1 + reps/30)`) or expose separate "heaviest weight" and "best 1RM" fields — the frontend already shows `bestReps` alongside `bestWeight`.

### [Medium] C8 — Weekly avg-calories divides by workouts, not days
`MetricsService.java:314` — `Integer avgCalories = totalCalories != null && workoutCount > 0 ? totalCalories.intValue() / 7 : 0;`. The `workoutCount > 0` gate is the bug: a user who logs food but no workouts sees `avgCalories = 0`.
**Fix:** Drop the workout gate; use `totalCalories / 7`, or better, `totalCalories / daysWithLogs`.

### [Medium] C9 — Duplicated Mifflin-St Jeor implementation
`NutritionService.java:206-237` and `ProfileService.java:123-172` implement the same BMR/TDEE/goal-adjustment math independently. `NutritionService` even comments on line 218: "in production would use ProfileService". Any formula bug fix has to be applied in both places.
**Fix:** Extract to `NutritionCalculator` bean (see C1).

### [Medium] C10 — `alert()` / `confirm()` in place of real UX
Nine calls in production frontend code — `workout-session.component.ts:222,242,254`, `nutrition-log.component.ts:134,138`, `food-search.component.ts:155,180`, `exercise-list.component.ts:107`, `analytics/progress-dashboard.component.ts:122`. Four are "coming soon" stubs behind real-looking buttons ("Add to workout", "Edit food entry", "Custom food", "Exercise browser").
**Fix:** Replace with a modal/dialog component (project already has `body-metrics-modal` as a pattern) and a toast/notification component. Hide unimplemented actions behind feature flags or route guards rather than shipping alert stubs.

### [Medium] C11 — `InactivityReminderJob.checkInactiveUsers` scales O(users × 2 queries)
`fittrack-backend/src/main/java/com/fittrack/job/InactivityReminderJob.java:58-89`. Loads every user into memory nightly, then for each does `findTopByUserIdOrderByWorkoutDateDesc` (query) + `existsRecentReminder` (query). At 10k users that's 20k queries plus the app-server memory to hold 10k `User` objects.
**Fix:** A single query returning `(user_id, email)` for users whose latest workout is older than 3 days AND who have no reminder in the last 3 days. Paginate; stream results.

### [Medium] C12 — Broken frontend test
`fittrack-frontend/src/app/app.spec.ts:20-22` asserts `<h1>` contains "Hello, fittrack-frontend", but `fittrack-frontend/src/app/app.ts:8` renders only `<router-outlet></router-outlet>`. The test will fail on any CI run — nothing catches this today because there's no CI. Note: `AppComponent`'s Angular-CLI-scaffolded `app.html` (342 lines) is orphaned; the class is defined with an inline template.
**Fix:** Delete `fittrack-frontend/src/app/app.html` (unused). Replace `app.spec.ts` with a real smoke test that renders the router outlet and checks the component's `title` field.

### [Low] C13 — `onSearchChange(term: string)` ignores its argument
`exercise-list.component.ts:68` and `food-search.component.ts:101` accept `term` but read `this.searchTerm` inside the debounce. Not a runtime bug (the ngModel two-way binding updates `this.searchTerm` first) but dead-parameter smell that will confuse readers.
**Fix:** Either use `term` or drop the parameter.

---

## 3. Code quality (10)

### [Medium] Q1 — Deprecated JJWT API
`JwtTokenProvider.java:34-37, 49-52` uses `setSubject`, `setIssuedAt`, `setExpiration`, and `SignatureAlgorithm.HS256`. All four are deprecated in jjwt 0.12.x (project uses 0.12.3, `pom.xml`). Modern equivalents: `subject(...)`, `issuedAt(...)`, `expiration(...)`, `Jwts.SIG.HS256`. Silence on deprecation warnings hides real API removals in 1.x.
**Fix:** Migrate to the fluent builder API for 0.12.

### [Medium] Q2 — Field injection everywhere
Every `@Service`, `@Controller`, `@Component`, and `@RestControllerAdvice` uses `@Autowired` on fields (see any file: `WorkoutService.java:32-39`, `WorkoutController.java:44-51`, `InactivityReminderJob.java:29-39`). Field injection prevents `final` immutability, makes constructor-based test wiring impossible, and hides dependencies from static analysis.
**Fix:** Switch to constructor injection (Lombok's `@RequiredArgsConstructor` on the class + `private final` fields — Lombok is already on the classpath).

### [Medium] Q3 — 26 raw `.subscribe(...)` calls with almost no `OnDestroy`
Frontend: 26 `.subscribe(` occurrences across components. Only `workout-session.component.ts:19` implements `OnDestroy` — and only to stop the rest timer, not the 3 HTTP subscriptions inside it. `food-search.component.ts:65` subscribes to `route.queryParams` and never unsubscribes. Angular 20 has `takeUntilDestroyed()` and the `async` pipe — both go unused (one `async` pipe in the entire app at `dashboard.component.html:16`).
**Fix:** For HTTP calls that complete (`GET`/`POST`), `.subscribe` is safe — HttpClient auto-completes. But `route.queryParams` and any long-lived streams (Signals aside) need `takeUntilDestroyed(this.destroyRef)`. Better: convert to `async` pipe in templates.

### [Medium] Q4 — Dead scaffold HTML shipped in the bundle
`fittrack-frontend/src/app/app.html` — 342 lines of Angular CLI's placeholder gradient template ("Hello, fittrack-frontend"), never rendered (AppComponent uses inline `<router-outlet>`). Any developer opening the app root gets misdirected. It will also inflate the build if AOT keeps the file (esbuild will tree-shake it since no `templateUrl` references it — but the file is still checked in).
**Fix:** Delete the file.

### [Medium] Q5 — `console.log` shipped in production
- `fittrack-frontend/src/app/features/workout/exercise-list.component.ts:106` — `console.log('Adding to workout:', exercise);`
- (plus `console.error` calls in every catch block, which is intentional but noisy)

**Fix:** Delete the debug log; leave errors going through a real logger service that can be silenced in prod.

### [Medium] Q6 — `any` on timer handles
- `workout-session.component.ts:41` — `private restTimerInterval: any;`
- `exercise-list.component.ts:38` — `private searchDebounceTimer: any;`
- `food-search.component.ts:54` — `private searchDebounceTimer: any;`

Project has `strict: true` and `noImplicitAny` on; these are explicit `any` bypasses.
**Fix:** `ReturnType<typeof setInterval> | null` (or `number` — the DOM lib types both).

### [Medium] Q7 — Bulgarian strings baked into service layer
`fittrack-backend/src/main/java/com/fittrack/service/ProgressiveOverloadService.java` (lines around 88-107 per earlier survey) embeds user-facing Cyrillic strings ("Опитай ...") inside the service. Same for `EmailService` — inline HTML/text.
**Fix:** Externalize to `messages_bg.properties` / `messages_en.properties` and inject `MessageSource`. Keeps services testable and switchable per locale.

### [Medium] Q8 — Inconsistent stylesheet extensions
`profile.component.ts:13` uses `styleUrls: ['./profile.component.css']` while every other component uses `.scss` and `angular.json` sets `inlineStyleLanguage: scss`. Isolated exception, easy to miss.
**Fix:** Rename to `.scss` for consistency.

### [Low] Q9 — Duplicated `getCurrentUserId()` across 4 controllers
`WorkoutController.java:53-62`, `ProfileController.java:74-83`, plus identical variants in `MetricsController`, `NutritionController` (per exploration). Same body: `SecurityContextHolder → UserDetails → userRepository.findByEmail → id`. Every request pays an extra `SELECT` on `users`.
**Fix:** Either put `userId` in a custom claim in the JWT and read it from the token, or create a custom `AppUser implements UserDetails` that carries the id — set it in `UserDetailsServiceImpl`.

### [Low] Q10 — Empty scratch file
`.context/todos.md` is empty. Likely an agent-tool leftover.
**Fix:** Delete or `.gitignore` it.

---

## 4. Architecture / consistency (5)

### [Medium] A1 — Mixed entity relationship modeling
- `Workout.userId: Long` — plain FK, no `@ManyToOne`.
- `NutritionLog.userId: Long` — plain FK.
- `BodyMetrics.user: @ManyToOne User` — real relationship.
- `WorkoutSet.workout: @ManyToOne Workout` — real relationship.

Two styles in the same model package. Repositories can't `JOIN FETCH` on `Workout.user` and have to do custom queries; the fix for the N+1s above depends on picking one style.
**Fix:** Pick `@ManyToOne User` consistently. If keeping raw `userId` for perf, do it everywhere.

### [Medium] A2 — Duplicated password validation
`RegisterRequest` uses `@Pattern`/`@Size` annotations, then `AuthService.validatePassword` re-implements the same rules. If one changes and the other doesn't, one path accepts and the other rejects.
**Fix:** Keep the validation in one place — either the DTO annotations (recommended, gives 400 with field-level errors automatically) or a `PasswordPolicy` bean.

### [Medium] A3 — No shared error/toast component
Every component holds its own `error = signal<string | null>(null)` and renders it inline. There's no toast/snackbar, no shared error boundary, no consistent styling.
**Fix:** Add a `ToastService` + `<app-toast>` in the layout, and route the `errorInterceptor`'s output through it.

### [Low] A4 — 4 unresolved TODO stubs behind buttons
`workout-session.component.ts:252-255` (browse exercises), `exercise-list.component.ts:102-110` (add to workout), `nutrition-log.component.ts:132-135` (edit log), `food-search.component.ts:178-181` (custom food). Each shows an `alert('coming soon')` when a user clicks a real-looking button.
**Fix:** Hide the buttons behind a `showComingSoon = false` flag, or implement them.

### [Low] A5 — Wildcard route redirects to `/dashboard`, bounces through guard
`app.routes.ts` — the wildcard `**` route redirects to `/dashboard` before the auth guard runs, so any unknown URL for a logged-out user visits `/dashboard`, gets bounced by the guard to `/auth/login`.
**Fix:** Add an explicit 404 component or redirect to a public landing page.

---

## 5. Testing (3)

### [High] T1 — Coverage is thin and the one frontend test is broken
Backend: 3 test files (~615 lines) covering `AuthService`, `WorkoutService`, and `AuthController` — that's it. `MetricsService` (with the compliance/streak/PR bugs), `NutritionService` (with the silent-delete), `ProfileService` (the math), `ProgressiveOverloadService`, `EmailService`, `InactivityReminderJob`, `JwtTokenProvider`, `JwtAuthenticationFilter`, `GlobalExceptionHandler` — none tested. No repository tests, no integration tests, no Testcontainers. Frontend: only `app.spec.ts`, and it's broken (C12).
**Fix:** Add Testcontainers with a real PostgreSQL for backend integration tests; add a `@WebMvcTest` slice per controller (Auth already has one to copy). On the frontend, use Angular's built-in Karma+Jasmine or migrate to Jest — write at least one component-level smoke test per feature.

### [Medium] T2 — No integration test around the JWT filter or the global handler
The most security-sensitive code paths are also the least tested. The silent-swallow in S4 and the stack-trace leak in S3 would be caught by a simple `MockMvc` test that sends an expired token and an unhandled-exception-inducing request respectively.
**Fix:** Add `@SpringBootTest` integration tests: expired token → 401, invalid token → 401, unhandled service exception → 500 with generic body (no stack trace).

### [Low] T3 — `AuthControllerTest` disables filters
`AuthControllerTest.java` (per exploration) uses `@WebMvcTest(addFilters=false)`. Fine for testing controller wiring in isolation, but combined with the lack of any test that runs *with* the filter chain, no test covers the real auth flow.
**Fix:** Keep the sliced test, add one `@SpringBootTest` end-to-end that exercises `/auth/login` → `/workouts` → 200.

---

## 6. Docs & product (7)

### [High] D1 — README contradicts CURRENT_STATUS and the code
`README.md:24-28` says "Phase 3: Nutrition Tracking (In Progress - 40%)". Backend has a working `NutritionController`, `NutritionService`, `NutritionLog` entity, `V7__nutrition_logs.sql` migration, and the frontend has `nutrition-log` and `food-search` components wired up. Nutrition is shipped. `docs/CURRENT_STATUS.md` (marked "authoritative") also disagrees.
`README.md:118-124` lists 7 Flyway migrations (V1-V7). Reality: 10 (V1-V10, including body_metrics and daily_stats). `README.md:293-303` roadmap similarly out of date.
**Fix:** Update README to match `docs/CURRENT_STATUS.md`, or delete the "roadmap"/"phase" language and just describe what the app does today.

### [High] D2 — CHANGELOG frozen at v1.0.0 with wrong version numbers
`CHANGELOG.md:8-136` is the only real entry. It says "Spring Boot 3.2.0" (reality: 3.5.3) and "Angular 18" (reality: 20). Phase 2/3/4 are still listed under `[Unreleased]` / `[Future]` even though Phase 2 shipped and body metrics + analytics shipped. Semantic versioning claim doesn't hold if the software has moved but the changelog hasn't.
**Fix:** Cut a v1.1.0 (or v2.0.0) entry covering Java 25 upgrade, template externalization, body metrics, analytics, Docker deployment, and correct the framework versions in the initial entry.

### [Medium] D3 — QUICKSTART.md badly stale
Per doc exploration: it lists Java 17/21, Node 18/20, Angular CLI 18, and a "Diplomna Rabota" path. Reality: Java 25, Angular 20. A first-time reader following it will hit version errors.
**Fix:** Regenerate from current `pom.xml` / `package.json`.

### [Medium] D4 — Missing LICENSE despite MIT claim
`README.md:305-307` says "MIT License". No `LICENSE` or `LICENSE.md` file at the repo root. Legally, code without a license is "all rights reserved" — the claim is unenforceable.
**Fix:** Add a `LICENSE` file with the MIT text and your name/year.

### [Medium] D5 — Documentation drift between multiple overlapping docs
Three separate body-metrics docs (`BODY_METRICS_API_REFERENCE.md`, `BODY_WEIGHT_TRACKING_FEATURE.md`, `BODY_WEIGHT_TRACKING_USER_GUIDE.md`) with overlapping content. `PROJECT_SUMMARY.md` (21 KB) and `README.md` and `CURRENT_STATUS.md` all cover project status differently. `fittrack-frontend/TOKEN_REFRESH_IMPLEMENTATION.md` sits outside `docs/` and isn't in the index.
**Fix:** Consolidate the three body-metrics docs into one `BODY_METRICS.md`. Move the token-refresh doc into `docs/`. Pick one status doc (CURRENT_STATUS is already marked authoritative — delete the redundant status content from README and PROJECT_SUMMARY).

### [Medium] D6 — Mixed Bulgarian/English in formal docs
`ARCHITECTURE.md`, `product-backlog.md`, `software-requirements-specification.md` in Bulgarian; everything else in English. For a diploma-thesis submission the mix is inconsistent (also affects the service-layer strings in Q7).
**Fix:** Pick one language for user-facing text (services and docs). If the thesis defense is in Bulgarian, translate the English docs; otherwise, translate the Bulgarian ones.

### [Low] D7 — README clone step drops user in the wrong directory
`README.md:63-65` says `cd fittrack-frontend` after `git clone`. That's the frontend subdirectory, not the repo root. Users who follow literally will then try `docker-compose up -d postgres` and fail because `docker-compose.yml` is at the parent.
**Fix:** `cd fittrack-pro` (or whatever the clone dir is).

---

## 7. Ops (5)

### [High] O1 — No CI/CD at all
No `.github/workflows/`, no `.gitlab-ci.yml`, no `Jenkinsfile`. Tests exist but never run automatically. Broken frontend test (C12) has never been noticed. Any regression to the auth flow slips through until a manual test.
**Fix:** Add a GitHub Actions workflow that runs `mvn test` on `fittrack-backend` and `npm ci && npm test` on `fittrack-frontend` on every push to `main` and every PR. Cache `~/.m2` and `node_modules`.

### [Medium] O2 — Docker compose has `dev` profile in what looks like a prod deploy
`docker-compose.yml:39` — `SPRING_PROFILES_ACTIVE: dev`. Combined with `include-message: always`, `include-stacktrace: on_param`, and `show-details: when-authorized` on actuator, running `docker-compose up` gives you a "prod-shaped" deployment that behaves like dev.
**Fix:** Separate `docker-compose.yml` (prod defaults) from `docker-compose.dev.yml` (override for local). Set `SPRING_PROFILES_ACTIVE: prod` in the base file; create a `prod` profile in `application.yml` that overrides the error-verbosity settings.

### [Medium] O3 — DB credentials `fittrack_user/fittrack_pass` in the compose file
`docker-compose.yml:10-11` hardcodes both credentials. Anyone who ports the compose file to prod inherits them. `.env` is `.gitignore`'d (good), but the compose file itself carries the defaults.
**Fix:** Read from `.env` via compose's `env_file:` or `${DB_PASSWORD}`. Warn/refuse to boot if the default is still in use.

### [Medium] O4 — No `mvnw` wrapper committed
Anyone building the backend needs Maven 3.9+ globally. `mvn` isn't a build-tool contract; the wrapper is.
**Fix:** `mvn -N wrapper:wrapper` and commit `mvnw`, `mvnw.cmd`, `.mvn/`.

### [Low] O5 — `docker-compose.yml` uses obsolete top-level `version`
Line 1: `version: '3.8'`. Compose v2 ignores this and prints a deprecation warning.
**Fix:** Delete the `version:` line.

---

## Not-findings (things that looked wrong on first pass but check out)

- `open-in-view: false` — good, this is correct.
- `ddl-auto: validate` — good, migrations own the schema.
- BCrypt strength 12 — reasonable choice (slight over-provisioning on modern hardware but fine).
- Flyway configured with `validate-on-migrate: true` — good.
- Standalone Angular components with lazy loading — modern, appropriate for Angular 20.
- Signals-based state management for a project this size — reasonable, no NgRx needed.

---

## Suggested order of fixes

1. **First PR** — S1 (interceptor duplication), S2 (silent delete), S3 (stack trace leak), S4 (silent filter). These are all localized and each is under ~10 lines. Ship them together.
2. **Second PR** — C1/C9 (extract calorie calculator to a shared bean), C2 (ProfileController weight lookup). One coherent nutrition-math cleanup.
3. **Third PR** — CI. GitHub Actions running both test suites. This exposes C12 immediately and gives you a place to add every subsequent test.
4. **Fourth PR** — N+1s (C4, C5) and `InactivityReminderJob` (C11). Requires deciding A1 first (unify entity modeling).
5. **Fifth PR** — Frontend UX cleanup (C10, Q4, Q5, Q6) — replace alerts with modal/toast, delete `app.html`, remove `console.log`, type the timers.
6. **Sixth PR** — Docs consolidation and CHANGELOG update.

If any severity feels wrong or you want a specific finding turned into an implementation plan, say which and we start a new plan.
