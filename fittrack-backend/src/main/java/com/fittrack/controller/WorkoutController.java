package com.fittrack.controller;

import com.fittrack.dto.request.WorkoutSetRequest;
import com.fittrack.dto.request.WorkoutStartRequest;
import com.fittrack.dto.response.*;
import com.fittrack.security.SecurityUtils;
import com.fittrack.service.ProgressiveOverloadService;
import com.fittrack.service.WorkoutService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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
@RequestMapping("/api/v1/workouts")
@Slf4j
@RequiredArgsConstructor
@Tag(name = "Workouts", description = "Workout tracking, logging sets, and progressive overload suggestions")
@SecurityRequirement(name = "bearerAuth")
public class WorkoutController {

    private final WorkoutService workoutService;
    private final ProgressiveOverloadService overloadService;

    @Operation(summary = "Start new workout", description = "Creates a new workout session for the authenticated user (US-04)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Workout started successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input or active workout already exists")
    })
    @PostMapping
    public ResponseEntity<WorkoutResponse> startWorkout(@Valid @RequestBody WorkoutStartRequest request) {
        Long userId = SecurityUtils.currentUserId();
        log.info("POST /api/v1/workouts - Starting workout for user {}", userId);

        WorkoutResponse response = workoutService.startWorkout(userId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Log workout set", description = "Records a set for a specific exercise in the current workout (US-05, US-06)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Set logged successfully"),
            @ApiResponse(responseCode = "404", description = "Workout not found")
    })
    @PostMapping("/{id}/sets")
    public ResponseEntity<WorkoutSetResponse> logSet(
            @Parameter(description = "Workout ID") @PathVariable Long id,
            @Valid @RequestBody WorkoutSetRequest request) {

        Long userId = SecurityUtils.currentUserId();
        log.info("POST /api/v1/workouts/{}/sets - Logging set for user {}", id, userId);

        WorkoutSetResponse response = workoutService.logSet(id, request, userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/finish")
    public ResponseEntity<WorkoutResponse> finishWorkout(@PathVariable Long id) {
        Long userId = SecurityUtils.currentUserId();
        log.info("PUT /api/v1/workouts/{}/finish - Finishing workout for user {}", id, userId);

        WorkoutResponse response = workoutService.finishWorkout(id, userId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<WorkoutHistoryResponse>> getHistory(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        Long userId = SecurityUtils.currentUserId();
        log.info("GET /api/v1/workouts/history - Fetching history for user {} from {} to {}",
            userId, startDate, endDate);

        List<WorkoutHistoryResponse> history = workoutService.getWorkoutHistory(userId, startDate, endDate);

        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutDetailResponse> getWorkoutDetail(@PathVariable Long id) {
        Long userId = SecurityUtils.currentUserId();
        log.info("GET /api/v1/workouts/{} - Fetching workout detail for user {}", id, userId);

        WorkoutDetailResponse response = workoutService.getWorkoutDetail(id, userId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{workoutId}/exercises/{exerciseId}/previous")
    public ResponseEntity<List<WorkoutSetResponse>> getPreviousWorkoutData(
            @PathVariable Long workoutId,
            @PathVariable Long exerciseId) {

        Long userId = SecurityUtils.currentUserId();
        log.info("GET /api/v1/workouts/{}/exercises/{}/previous - Fetching previous data for user {}",
            workoutId, exerciseId, userId);

        List<WorkoutSetResponse> previousSets = workoutService.getPreviousWorkoutData(userId, exerciseId, workoutId);

        return ResponseEntity.ok(previousSets);
    }

    @Operation(
            summary = "Get progressive overload suggestion",
            description = "Analyzes previous workout performance and suggests progression (weight/rep increase) for the exercise (US-15)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Suggestion generated"),
            @ApiResponse(responseCode = "204", description = "No suggestion available (insufficient data or already progressing)")
    })
    @GetMapping("/exercises/{exerciseId}/overload-suggestion")
    public ResponseEntity<OverloadSuggestion> getOverloadSuggestion(
            @Parameter(description = "Exercise ID") @PathVariable Long exerciseId) {
        Long userId = SecurityUtils.currentUserId();
        log.info("GET /api/v1/workouts/exercises/{}/overload-suggestion - Fetching for user {}",
                exerciseId, userId);

        OverloadSuggestion suggestion = overloadService.getProgressionSuggestion(userId, exerciseId);

        if (suggestion == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(suggestion);
    }

    @PostMapping("/exercises/{exerciseId}/check-overload")
    public ResponseEntity<OverloadSuggestion> checkOverloadOpportunity(
            @PathVariable Long exerciseId,
            @RequestParam int reps,
            @RequestParam double weight,
            @RequestParam(defaultValue = "5") int rpe) {

        Long userId = SecurityUtils.currentUserId();
        log.info("POST /api/v1/workouts/exercises/{}/check-overload - Checking for user {}",
                exerciseId, userId);

        OverloadSuggestion suggestion = overloadService.checkForOverloadOpportunity(
                userId, exerciseId, reps, weight, rpe
        );

        if (suggestion == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(suggestion);
    }
}
