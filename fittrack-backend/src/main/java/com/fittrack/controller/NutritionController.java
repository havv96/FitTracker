package com.fittrack.controller;

import com.fittrack.dto.request.NutritionLogRequest;
import com.fittrack.dto.response.DailyNutritionSummary;
import com.fittrack.dto.response.NutritionLogResponse;
import com.fittrack.model.FoodItem;
import com.fittrack.security.SecurityUtils;
import com.fittrack.service.NutritionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/nutrition")
@Slf4j
@RequiredArgsConstructor
@Tag(name = "Nutrition", description = "Food search, logging, and macro tracking endpoints")
@SecurityRequirement(name = "bearerAuth")
public class NutritionController {

    private final NutritionService nutritionService;

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

    @GetMapping("/foods/{id}")
    public ResponseEntity<FoodItem> getFoodById(@PathVariable Long id) {
        FoodItem food = nutritionService.getFoodById(id);
        return ResponseEntity.ok(food);
    }

    @GetMapping("/foods/barcode/{barcode}")
    public ResponseEntity<FoodItem> getFoodByBarcode(@PathVariable String barcode) {
        FoodItem food = nutritionService.getFoodByBarcode(barcode);
        return ResponseEntity.ok(food);
    }

    @Operation(summary = "Log food intake", description = "Records food consumption with servings and meal type. Calculates total macros (US-10)")
    @PostMapping("/logs")
    public ResponseEntity<NutritionLogResponse> logFood(@Valid @RequestBody NutritionLogRequest request) {
        Long userId = SecurityUtils.currentUserId();
        log.info("Logging food for user ID: {}", userId);

        NutritionLogResponse response = nutritionService.logFood(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Get daily nutrition summary", description = "Shows consumed vs target calories and macros with real-time progress (US-11)")
    @GetMapping("/summary")
    public ResponseEntity<DailyNutritionSummary> getDailySummary(
            @Parameter(description = "Date (defaults to today)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        Long userId = SecurityUtils.currentUserId();
        LocalDate targetDate = date != null ? date : LocalDate.now();
        log.info("Getting daily nutrition summary for user ID: {} on date: {}", userId, targetDate);

        DailyNutritionSummary summary = nutritionService.getDailySummary(userId, targetDate);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/logs")
    public ResponseEntity<List<NutritionLogResponse>> getLogsInDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        Long userId = SecurityUtils.currentUserId();
        log.info("Getting nutrition logs for user ID: {} from {} to {}", userId, startDate, endDate);

        List<NutritionLogResponse> logs = nutritionService.getLogsInDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(logs);
    }

    @DeleteMapping("/logs/{id}")
    public ResponseEntity<Void> deleteNutritionLog(@PathVariable Long id) {
        Long userId = SecurityUtils.currentUserId();
        log.info("Deleting nutrition log ID: {} for user ID: {}", id, userId);

        nutritionService.deleteNutritionLog(userId, id);
        return ResponseEntity.noContent().build();
    }
}
