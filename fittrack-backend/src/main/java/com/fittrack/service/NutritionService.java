package com.fittrack.service;

import com.fittrack.dto.request.NutritionLogRequest;
import com.fittrack.dto.response.DailyNutritionSummary;
import com.fittrack.dto.response.NutritionLogResponse;
import com.fittrack.exception.ResourceNotFoundException;
import com.fittrack.model.FoodItem;
import com.fittrack.model.NutritionLog;
import com.fittrack.model.UserProfile;
import com.fittrack.repository.DailyStatsRepository;
import com.fittrack.repository.FoodItemRepository;
import com.fittrack.repository.NutritionLogRepository;
import com.fittrack.repository.UserProfileRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Nutrition Service
 * Handles food search, logging, and nutrition tracking
 * Reference: US-10, US-11, FR-NUTR-01, FR-NUTR-02, FR-NUTR-03
 */
@Service
@Slf4j
public class NutritionService {

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private NutritionLogRepository nutritionLogRepository;

    @Autowired
    private UserProfileRepository profileRepository;

    @Autowired
    private DailyStatsRepository dailyStatsRepository;

    /**
     * US-10: Search food database
     * AC: Search by name or brand
     */
    @Transactional(readOnly = true)
    public Page<FoodItem> searchFoods(String searchTerm, Boolean verifiedOnly, Pageable pageable) {
        log.info("Searching foods with term: {}, verifiedOnly: {}", searchTerm, verifiedOnly);
        return foodItemRepository.searchFoodItems(searchTerm, verifiedOnly != null ? verifiedOnly : false, pageable);
    }

    /**
     * US-10: Get food item by ID
     */
    @Transactional(readOnly = true)
    public FoodItem getFoodById(Long foodId) {
        return foodItemRepository.findById(foodId)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found"));
    }

    /**
     * US-10: Get food item by barcode
     */
    @Transactional(readOnly = true)
    public FoodItem getFoodByBarcode(String barcode) {
        return foodItemRepository.findByBarcode(barcode)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found for barcode: " + barcode));
    }

    /**
     * US-10: Log food intake
     * AC: Select meal type, servings
     * AC: Calculate macros based on servings
     */
    @Transactional
    public NutritionLogResponse logFood(Long userId, NutritionLogRequest request) {
        log.info("Logging food for user ID: {}, food item ID: {}", userId, request.getFoodItemId());

        // Find food item
        FoodItem foodItem = foodItemRepository.findById(request.getFoodItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found"));

        // AC: Calculate total macros based on servings
        BigDecimal servings = request.getServings();
        BigDecimal totalCalories = foodItem.getCalories().multiply(servings);
        BigDecimal totalProtein = foodItem.getProteinG().multiply(servings);
        BigDecimal totalCarbs = foodItem.getCarbsG().multiply(servings);
        BigDecimal totalFat = foodItem.getFatG().multiply(servings);

        // Create nutrition log
        NutritionLog nutritionLog = new NutritionLog();
        nutritionLog.setUserId(userId);
        nutritionLog.setFoodItem(foodItem);
        nutritionLog.setLogDate(request.getLogDate() != null ? request.getLogDate() : LocalDate.now());
        nutritionLog.setMealType(request.getMealType());
        nutritionLog.setServings(servings);
        nutritionLog.setTotalCalories(totalCalories);
        nutritionLog.setTotalProteinG(totalProtein);
        nutritionLog.setTotalCarbsG(totalCarbs);
        nutritionLog.setTotalFatG(totalFat);
        nutritionLog.setNotes(request.getNotes());
        nutritionLog.setLoggedAt(LocalDateTime.now());

        NutritionLog savedLog = nutritionLogRepository.save(nutritionLog);
        log.info("Food logged successfully: {} for user ID: {}", foodItem.getName(), userId);

        return NutritionLogResponse.fromEntity(savedLog);
    }

    /**
     * US-11: Get daily nutrition summary
     * AC: Show target vs consumed calories and macros
     * AC: Real-time progress bars
     */
    @Transactional(readOnly = true)
    public DailyNutritionSummary getDailySummary(Long userId, LocalDate date) {
        log.info("Getting daily nutrition summary for user ID: {} on date: {}", userId, date);

        // Get user profile to calculate targets (optional - use defaults if not found)
        UserProfile profile = profileRepository.findByUserId(userId).orElse(null);

        // Get current weight from daily stats (latest entry)
        BigDecimal currentWeight = dailyStatsRepository.findRecentWeightLogs(userId).stream()
                .findFirst()
                .map(stat -> stat.getWeightKg())
                .orElse(null);

        // Calculate targets using profile data (or defaults if profile doesn't exist)
        double targetCalories = calculateTargetCalories(profile, currentWeight);
        MacroTargets targets = calculateMacroTargets(targetCalories);

        // Get all logs for the specified date
        List<NutritionLog> logs = nutritionLogRepository.findByUserIdAndLogDateOrderByLoggedAtAsc(userId, date);

        // Calculate consumed totals
        double consumedCalories = logs.stream()
                .mapToDouble(l -> l.getTotalCalories().doubleValue())
                .sum();
        double consumedProtein = logs.stream()
                .mapToDouble(l -> l.getTotalProteinG().doubleValue())
                .sum();
        double consumedCarbs = logs.stream()
                .mapToDouble(l -> l.getTotalCarbsG().doubleValue())
                .sum();
        double consumedFat = logs.stream()
                .mapToDouble(l -> l.getTotalFatG().doubleValue())
                .sum();

        // Build summary
        DailyNutritionSummary summary = new DailyNutritionSummary();
        summary.setDate(date);
        summary.setTargetCalories(targetCalories);
        summary.setTargetProtein(targets.protein);
        summary.setTargetCarbs(targets.carbs);
        summary.setTargetFat(targets.fat);
        summary.setConsumedCalories(consumedCalories);
        summary.setConsumedProtein(consumedProtein);
        summary.setConsumedCarbs(consumedCarbs);
        summary.setConsumedFat(consumedFat);
        summary.calculateRemaining();

        // Map logs to response DTOs
        List<NutritionLogResponse> logResponses = logs.stream()
                .map(NutritionLogResponse::fromEntity)
                .collect(Collectors.toList());
        summary.setLogs(logResponses);

        return summary;
    }

    /**
     * Delete nutrition log
     */
    @Transactional
    public void deleteNutritionLog(Long userId, Long logId) {
        log.info("Deleting nutrition log ID: {} for user ID: {}", logId, userId);
        nutritionLogRepository.deleteByUserIdAndId(userId, logId);
    }

    /**
     * Get nutrition logs for a date range
     */
    @Transactional(readOnly = true)
    public List<NutritionLogResponse> getLogsInDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        log.info("Getting nutrition logs for user ID: {} from {} to {}", userId, startDate, endDate);
        List<NutritionLog> logs = nutritionLogRepository.findByUserIdAndLogDateBetweenOrderByLogDateDesc(
                userId, startDate, endDate
        );
        return logs.stream()
                .map(NutritionLogResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Helper methods

    /**
     * Calculate target calories based on profile
     * Uses same logic as ProfileService
     */
    private double calculateTargetCalories(UserProfile profile, BigDecimal currentWeight) {
        // If no profile exists, use default values
        if (profile == null) {
            log.info("No profile found, using default calorie target");
            return 2000.0; // Default target
        }

        if (currentWeight == null) {
            // Default to 2000 calories if no weight logged
            return 2000.0;
        }

        // Use simplified calculation - in production would use ProfileService
        double weightKg = currentWeight.doubleValue();
        double heightCm = profile.getHeightCm().doubleValue();
        int age = java.time.Period.between(profile.getDateOfBirth(), LocalDate.now()).getYears();

        // Mifflin-St Jeor formula
        double bmr;
        if (profile.getGender() == UserProfile.Gender.MALE) {
            bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
        } else {
            bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
        }

        // Apply activity multiplier
        double activityMultiplier = getActivityMultiplier(profile.getActivityLevel());
        double tdee = bmr * activityMultiplier;

        // Adjust for weight goal
        return adjustForWeightGoal(tdee, profile.getWeightGoal());
    }

    private double getActivityMultiplier(UserProfile.ActivityLevel activityLevel) {
        return switch (activityLevel) {
            case SEDENTARY -> 1.2;
            case LIGHTLY_ACTIVE -> 1.375;
            case MODERATELY_ACTIVE -> 1.55;
            case VERY_ACTIVE -> 1.725;
            case EXTRA_ACTIVE -> 1.9;
        };
    }

    private double adjustForWeightGoal(double tdee, UserProfile.WeightGoal weightGoal) {
        return switch (weightGoal) {
            case LOSE_SLOW -> tdee - 250;
            case LOSE_MODERATE -> tdee - 500;
            case LOSE_FAST -> tdee - 750;
            case MAINTAIN -> tdee;
            case GAIN_SLOW -> tdee + 250;
            case GAIN_MODERATE -> tdee + 500;
        };
    }

    /**
     * Calculate macro targets
     * 30% protein, 40% carbs, 30% fat
     */
    private MacroTargets calculateMacroTargets(double calories) {
        double proteinCals = calories * 0.30;
        double carbsCals = calories * 0.40;
        double fatCals = calories * 0.30;

        return new MacroTargets(
                proteinCals / 4.0,  // 4 cal/g protein
                carbsCals / 4.0,    // 4 cal/g carbs
                fatCals / 9.0       // 9 cal/g fat
        );
    }

    private record MacroTargets(double protein, double carbs, double fat) {}
}
