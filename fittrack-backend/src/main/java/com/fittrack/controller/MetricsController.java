package com.fittrack.controller;

import com.fittrack.dto.request.BodyMetricsRequest;
import com.fittrack.dto.request.WaterIntakeRequest;
import com.fittrack.dto.request.WeightLogRequest;
import com.fittrack.dto.response.*;
import com.fittrack.exception.ResourceNotFoundException;
import com.fittrack.model.DailyStats;
import com.fittrack.model.User;
import com.fittrack.repository.UserRepository;
import com.fittrack.service.MetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Metrics Controller
 * Handles water tracking, weight logging, and dashboard metrics
 * Base path: /api/v1/metrics
 */
@RestController
@RequestMapping("/api/v1/metrics")
@Slf4j
@Tag(name = "Metrics", description = "Health metrics: water tracking, weight logging, and dashboard analytics")
@SecurityRequirement(name = "bearerAuth")
public class MetricsController {

    @Autowired
    private MetricsService metricsService;

    @Autowired
    private UserRepository userRepository;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String email = userDetails.getUsername();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return user.getId();
    }

    /**
     * Add water intake
     * POST /api/v1/metrics/water
     * US-12: Water tracking
     */
    @Operation(summary = "Add water intake", description = "Log water consumption in milliliters. Supports quick-add buttons (US-12)")
    @PostMapping("/water")
    public ResponseEntity<DailyStats> addWater(@Valid @RequestBody WaterIntakeRequest request) {
        Long userId = getCurrentUserId();
        log.info("Adding {} ml water for user ID: {}", request.getMilliliters(), userId);

        DailyStats stats = metricsService.addWater(userId, request.getMilliliters());
        return ResponseEntity.status(HttpStatus.CREATED).body(stats);
    }

    /**
     * Log weight
     * POST /api/v1/metrics/weight
     * US-13: Weight logging
     */
    @Operation(summary = "Log weight", description = "Record body weight in kilograms with optional notes (US-13)")
    @PostMapping("/weight")
    public ResponseEntity<DailyStats> logWeight(@Valid @RequestBody WeightLogRequest request) {
        Long userId = getCurrentUserId();
        log.info("Logging weight {} kg for user ID: {}", request.getWeightKg(), userId);

        DailyStats stats = metricsService.logWeight(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(stats);
    }

    /**
     * Get weight trend
     * GET /api/v1/metrics/weight/trend
     * US-13: Weight visualization with trend line
     */
    @Operation(summary = "Get weight trend", description = "Visualize weight changes over time with trend analysis (US-13)")
    @GetMapping("/weight/trend")
    public ResponseEntity<WeightTrendResponse> getWeightTrend(
            @Parameter(description = "Start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        Long userId = getCurrentUserId();
        log.info("Getting weight trend for user ID: {} from {} to {}", userId, startDate, endDate);

        WeightTrendResponse trend = metricsService.getWeightTrend(userId, startDate, endDate);
        return ResponseEntity.ok(trend);
    }

    /**
     * Get today's stats
     * GET /api/v1/metrics/today
     */
    @GetMapping("/today")
    public ResponseEntity<DailyStats> getTodayStats() {
        Long userId = getCurrentUserId();
        log.info("Getting today's stats for user ID: {}", userId);

        DailyStats stats = metricsService.getTodayStats(userId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get stats for specific date
     * GET /api/v1/metrics/date/{date}
     */
    @GetMapping("/date/{date}")
    public ResponseEntity<DailyStats> getStatsForDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        Long userId = getCurrentUserId();
        log.info("Getting stats for user ID: {} on date: {}", userId, date);

        DailyStats stats = metricsService.getStatsForDate(userId, date);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get dashboard summary
     * GET /api/v1/metrics/dashboard
     */
    @Operation(summary = "Get dashboard summary", description = "Comprehensive overview of all health metrics: workouts, nutrition, water, weight")
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        Long userId = getCurrentUserId();
        log.info("Getting dashboard summary for user ID: {}", userId);

        DashboardSummaryResponse summary = metricsService.getDashboardSummary(userId);
        return ResponseEntity.ok(summary);
    }

    /**
     * Update daily notes
     * PUT /api/v1/metrics/notes
     */
    @PutMapping("/notes")
    public ResponseEntity<DailyStats> updateNotes(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestBody String notes) {

        Long userId = getCurrentUserId();
        log.info("Updating notes for user ID: {} on date: {}", userId, date);

        DailyStats stats = metricsService.updateNotes(userId, date, notes);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get analytics summary
     * GET /api/v1/metrics/summary
     */
    @Operation(summary = "Get analytics summary", description = "Comprehensive overview of fitness progress including workouts, PRs, and body metrics")
    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryResponse> getAnalyticsSummary() {
        Long userId = getCurrentUserId();
        log.info("Getting analytics summary for user ID: {}", userId);

        AnalyticsSummaryResponse summary = metricsService.getAnalyticsSummary(userId);
        return ResponseEntity.ok(summary);
    }

    /**
     * Get weekly progress
     * GET /api/v1/metrics/progress/weekly
     */
    @Operation(summary = "Get weekly progress", description = "Weekly breakdown of workouts and nutrition")
    @GetMapping("/progress/weekly")
    public ResponseEntity<List<WeeklyProgressResponse>> getWeeklyProgress(
            @Parameter(description = "Number of weeks to look back") @RequestParam(required = false, defaultValue = "4") Integer weeks) {

        Long userId = getCurrentUserId();
        log.info("Getting weekly progress for user ID: {} ({} weeks)", userId, weeks);

        List<WeeklyProgressResponse> progress = metricsService.getWeeklyProgress(userId, weeks);
        return ResponseEntity.ok(progress);
    }

    /**
     * Get personal records
     * GET /api/v1/metrics/personal-records
     */
    @Operation(summary = "Get personal records", description = "Best performances for each exercise")
    @GetMapping("/personal-records")
    public ResponseEntity<List<PersonalRecordResponse>> getPersonalRecords() {
        Long userId = getCurrentUserId();
        log.info("Getting personal records for user ID: {}", userId);

        List<PersonalRecordResponse> records = metricsService.getPersonalRecords(userId);
        return ResponseEntity.ok(records);
    }

    /**
     * Get body metrics
     * GET /api/v1/metrics/body-metrics
     */
    @Operation(summary = "Get body metrics", description = "Get body measurements and weight history")
    @GetMapping("/body-metrics")
    public ResponseEntity<List<BodyMetricsResponse>> getBodyMetrics(
            @Parameter(description = "Start date") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        Long userId = getCurrentUserId();
        log.info("Getting body metrics for user ID: {}", userId);

        List<BodyMetricsResponse> metrics = metricsService.getBodyMetrics(userId, startDate, endDate);
        return ResponseEntity.ok(metrics);
    }

    /**
     * Add body metrics
     * POST /api/v1/metrics/body-metrics
     */
    @Operation(summary = "Add body metrics", description = "Log body measurements and weight")
    @PostMapping("/body-metrics")
    public ResponseEntity<BodyMetricsResponse> addBodyMetrics(@Valid @RequestBody BodyMetricsRequest request) {
        Long userId = getCurrentUserId();
        log.info("Adding body metrics for user ID: {}", userId);

        BodyMetricsResponse response = metricsService.addBodyMetrics(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Update body metrics
     * PUT /api/v1/metrics/body-metrics/{id}
     */
    @Operation(summary = "Update body metrics", description = "Update existing body metrics entry")
    @PutMapping("/body-metrics/{id}")
    public ResponseEntity<BodyMetricsResponse> updateBodyMetrics(
            @PathVariable Long id,
            @Valid @RequestBody BodyMetricsRequest request) {

        Long userId = getCurrentUserId();
        log.info("Updating body metrics ID: {} for user ID: {}", id, userId);

        BodyMetricsResponse response = metricsService.updateBodyMetrics(userId, id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete body metrics
     * DELETE /api/v1/metrics/body-metrics/{id}
     */
    @Operation(summary = "Delete body metrics", description = "Delete a body metrics entry")
    @DeleteMapping("/body-metrics/{id}")
    public ResponseEntity<Void> deleteBodyMetrics(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        log.info("Deleting body metrics ID: {} for user ID: {}", id, userId);

        metricsService.deleteBodyMetrics(userId, id);
        return ResponseEntity.noContent().build();
    }
}
