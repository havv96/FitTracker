package com.fittrack.controller;

import com.fittrack.dto.request.NutritionLogRequest;
import com.fittrack.dto.response.DailyNutritionSummary;
import com.fittrack.dto.response.NutritionLogResponse;
import com.fittrack.exception.ResourceNotFoundException;
import com.fittrack.model.FoodItem;
import com.fittrack.model.User;
import com.fittrack.repository.UserRepository;
import com.fittrack.service.NutritionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
 * Nutrition Controller
 * Handles food search, logging, and nutrition tracking endpoints
 * Base path: /api/v1/nutrition
 */
@RestController
@RequestMapping("/api/v1/nutrition")
@Slf4j
@Tag(name = "Nutrition", description = "Food search, logging, and macro tracking endpoints")
@SecurityRequirement(name = "bearerAuth")
public class NutritionController {

    @Autowired
    private NutritionService nutritionService;

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
     * Search food database
     * GET /api/v1/nutrition/foods/search
     * US-10: Food search functionality
     */
    @Operation(summary = "Search food database", description = "Search for food items by name or brand (US-10)")
    @GetMapping("/foods/search")
    public ResponseEntity<Page<FoodItem>> searchFoods(
            @Parameter(description = "Search query") @RequestParam(required = false) String q,
            @Parameter(description = "Only show verified items") @RequestParam(required = false, defaultValue = "false") Boolean verifiedOnly,
            @Parameter(description = "Page number") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int size) {

        log.info("Searching foods with query: {}, verifiedOnly: {}", q, verifiedOnly);

        Pageable pageable = PageRequest.of(page, size);
        Page<FoodItem> foods = nutritionService.searchFoods(q, verifiedOnly, pageable);

        return ResponseEntity.ok(foods);
    }

    /**
     * Get food by ID
     * GET /api/v1/nutrition/foods/{id}
     */
    @GetMapping("/foods/{id}")
    public ResponseEntity<FoodItem> getFoodById(@PathVariable Long id) {
        FoodItem food = nutritionService.getFoodById(id);
        return ResponseEntity.ok(food);
    }

    /**
     * Get food by barcode
     * GET /api/v1/nutrition/foods/barcode/{barcode}
     */
    @GetMapping("/foods/barcode/{barcode}")
    public ResponseEntity<FoodItem> getFoodByBarcode(@PathVariable String barcode) {
        FoodItem food = nutritionService.getFoodByBarcode(barcode);
        return ResponseEntity.ok(food);
    }

    /**
     * Log food intake
     * POST /api/v1/nutrition/logs
     * US-10: Log food with meal type and servings
     */
    @Operation(summary = "Log food intake", description = "Records food consumption with servings and meal type. Calculates total macros (US-10)")
    @PostMapping("/logs")
    public ResponseEntity<NutritionLogResponse> logFood(@Valid @RequestBody NutritionLogRequest request) {
        Long userId = getCurrentUserId();
        log.info("Logging food for user ID: {}", userId);

        NutritionLogResponse response = nutritionService.logFood(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get daily nutrition summary
     * GET /api/v1/nutrition/summary
     * US-11: Display daily macro progress
     */
    @Operation(summary = "Get daily nutrition summary", description = "Shows consumed vs target calories and macros with real-time progress (US-11)")
    @GetMapping("/summary")
    public ResponseEntity<DailyNutritionSummary> getDailySummary(
            @Parameter(description = "Date (defaults to today)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        Long userId = getCurrentUserId();
        LocalDate targetDate = date != null ? date : LocalDate.now();
        log.info("Getting daily nutrition summary for user ID: {} on date: {}", userId, targetDate);

        DailyNutritionSummary summary = nutritionService.getDailySummary(userId, targetDate);
        return ResponseEntity.ok(summary);
    }

    /**
     * Get nutrition logs for date range
     * GET /api/v1/nutrition/logs
     */
    @GetMapping("/logs")
    public ResponseEntity<List<NutritionLogResponse>> getLogsInDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        Long userId = getCurrentUserId();
        log.info("Getting nutrition logs for user ID: {} from {} to {}", userId, startDate, endDate);

        List<NutritionLogResponse> logs = nutritionService.getLogsInDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(logs);
    }

    /**
     * Delete nutrition log
     * DELETE /api/v1/nutrition/logs/{id}
     */
    @DeleteMapping("/logs/{id}")
    public ResponseEntity<Void> deleteNutritionLog(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        log.info("Deleting nutrition log ID: {} for user ID: {}", id, userId);

        nutritionService.deleteNutritionLog(userId, id);
        return ResponseEntity.noContent().build();
    }
}
