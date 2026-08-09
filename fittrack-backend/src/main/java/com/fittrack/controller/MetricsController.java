package com.fittrack.controller;

import com.fittrack.dto.request.BodyMetricsRequest;
import com.fittrack.dto.request.WaterIntakeRequest;
import com.fittrack.dto.request.WeightLogRequest;
import com.fittrack.dto.response.*;
import com.fittrack.model.DailyStats;
import com.fittrack.security.SecurityUtils;
import com.fittrack.service.MetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/metrics")
@Slf4j
@RequiredArgsConstructor
@Tag(name = "Metrics", description = "Health metrics: water tracking, weight logging, and dashboard analytics")
@SecurityRequirement(name = "bearerAuth")
public class MetricsController {

    private final MetricsService metricsService;

    @Operation(summary = "Add water intake", description = "Log water consumption in milliliters. Supports quick-add buttons (US-12)")
    @PostMapping("/water")
    public ResponseEntity<DailyStats> addWater(@Valid @RequestBody WaterIntakeRequest request) {
        Long userId = SecurityUtils.currentUserId();
        log.info("Adding {} ml water for user ID: {}", request.getMilliliters(), userId);

        DailyStats stats = metricsService.addWater(userId, request.getMilliliters());
        return ResponseEntity.status(HttpStatus.CREATED).body(stats);
    }

    @Operation(summary = "Log weight", description = "Record body weight in kilograms with optional notes (US-13)")
    @PostMapping("/weight")
    public ResponseEntity<DailyStats> logWeight(@Valid @RequestBody WeightLogRequest request) {
        Long userId = SecurityUtils.currentUserId();
        log.info("Logging weight {} kg for user ID: {}", request.getWeightKg(), userId);

        DailyStats stats = metricsService.logWeight(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(stats);
    }

    @Operation(summary = "Get weight trend", description = "Visualize weight changes over time with trend analysis (US-13)")
    @GetMapping("/weight/trend")
    public ResponseEntity<WeightTrendResponse> getWeightTrend(
            @Parameter(description = "Start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        Long userId = SecurityUtils.currentUserId();
        log.info("Getting weight trend for user ID: {} from {} to {}", userId, startDate, endDate);

        WeightTrendResponse trend = metricsService.getWeightTrend(userId, startDate, endDate);
        return ResponseEntity.ok(trend);
    }

    @GetMapping("/today")
    public ResponseEntity<DailyStats> getTodayStats() {
        Long userId = SecurityUtils.currentUserId();
        log.info("Getting today's stats for user ID: {}", userId);

        DailyStats stats = metricsService.getTodayStats(userId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<DailyStats> getStatsForDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        Long userId = SecurityUtils.currentUserId();
        log.info("Getting stats for user ID: {} on date: {}", userId, date);

        DailyStats stats = metricsService.getStatsForDate(userId, date);
        return ResponseEntity.ok(stats);
    }

    @Operation(summary = "Get dashboard summary", description = "Comprehensive overview of all health metrics: workouts, nutrition, water, weight")
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        Long userId = SecurityUtils.currentUserId();
        log.info("Getting dashboard summary for user ID: {}", userId);

        DashboardSummaryResponse summary = metricsService.getDashboardSummary(userId);
        return ResponseEntity.ok(summary);
    }

    @PutMapping("/notes")
    public ResponseEntity<DailyStats> updateNotes(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestBody String notes) {

        Long userId = SecurityUtils.currentUserId();
        log.info("Updating notes for user ID: {} on date: {}", userId, date);

        DailyStats stats = metricsService.updateNotes(userId, date, notes);
        return ResponseEntity.ok(stats);
    }

    @Operation(summary = "Get analytics summary", description = "Comprehensive overview of fitness progress including workouts, PRs, and body metrics")
    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryResponse> getAnalyticsSummary() {
        Long userId = SecurityUtils.currentUserId();
        log.info("Getting analytics summary for user ID: {}", userId);

        AnalyticsSummaryResponse summary = metricsService.getAnalyticsSummary(userId);
        return ResponseEntity.ok(summary);
    }

    @Operation(summary = "Get weekly progress", description = "Weekly breakdown of workouts and nutrition")
    @GetMapping("/progress/weekly")
    public ResponseEntity<List<WeeklyProgressResponse>> getWeeklyProgress(
            @Parameter(description = "Number of weeks to look back") @RequestParam(required = false, defaultValue = "4") Integer weeks) {

        Long userId = SecurityUtils.currentUserId();
        log.info("Getting weekly progress for user ID: {} ({} weeks)", userId, weeks);

        List<WeeklyProgressResponse> progress = metricsService.getWeeklyProgress(userId, weeks);
        return ResponseEntity.ok(progress);
    }

    @Operation(summary = "Get personal records", description = "Best performances for each exercise")
    @GetMapping("/personal-records")
    public ResponseEntity<List<PersonalRecordResponse>> getPersonalRecords() {
        Long userId = SecurityUtils.currentUserId();
        log.info("Getting personal records for user ID: {}", userId);

        List<PersonalRecordResponse> records = metricsService.getPersonalRecords(userId);
        return ResponseEntity.ok(records);
    }

    @Operation(summary = "Get body metrics", description = "Get body measurements and weight history")
    @GetMapping("/body-metrics")
    public ResponseEntity<List<BodyMetricsResponse>> getBodyMetrics(
            @Parameter(description = "Start date") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        Long userId = SecurityUtils.currentUserId();
        log.info("Getting body metrics for user ID: {}", userId);

        List<BodyMetricsResponse> metrics = metricsService.getBodyMetrics(userId, startDate, endDate);
        return ResponseEntity.ok(metrics);
    }

    @Operation(summary = "Add body metrics", description = "Log body measurements and weight")
    @PostMapping("/body-metrics")
    public ResponseEntity<BodyMetricsResponse> addBodyMetrics(@Valid @RequestBody BodyMetricsRequest request) {
        Long userId = SecurityUtils.currentUserId();
        log.info("Adding body metrics for user ID: {}", userId);

        BodyMetricsResponse response = metricsService.addBodyMetrics(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Update body metrics", description = "Update existing body metrics entry")
    @PutMapping("/body-metrics/{id}")
    public ResponseEntity<BodyMetricsResponse> updateBodyMetrics(
            @PathVariable Long id,
            @Valid @RequestBody BodyMetricsRequest request) {

        Long userId = SecurityUtils.currentUserId();
        log.info("Updating body metrics ID: {} for user ID: {}", id, userId);

        BodyMetricsResponse response = metricsService.updateBodyMetrics(userId, id, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Delete body metrics", description = "Delete a body metrics entry")
    @DeleteMapping("/body-metrics/{id}")
    public ResponseEntity<Void> deleteBodyMetrics(@PathVariable Long id) {
        Long userId = SecurityUtils.currentUserId();
        log.info("Deleting body metrics ID: {} for user ID: {}", id, userId);

        metricsService.deleteBodyMetrics(userId, id);
        return ResponseEntity.noContent().build();
    }
}
