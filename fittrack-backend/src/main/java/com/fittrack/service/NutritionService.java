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

    @Autowired
    private NutritionCalculator nutritionCalculator;

    @Transactional(readOnly = true)
    public Page<FoodItem> searchFoods(String searchTerm, Boolean verifiedOnly, Pageable pageable) {
        log.info("Searching foods with term: {}, verifiedOnly: {}", searchTerm, verifiedOnly);
        return foodItemRepository.searchFoodItems(searchTerm, verifiedOnly != null ? verifiedOnly : false, pageable);
    }

    @Transactional(readOnly = true)
    public FoodItem getFoodById(Long foodId) {
        return foodItemRepository.findById(foodId)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found"));
    }

    @Transactional(readOnly = true)
    public FoodItem getFoodByBarcode(String barcode) {
        return foodItemRepository.findByBarcode(barcode)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found for barcode: " + barcode));
    }

    @Transactional
    public NutritionLogResponse logFood(Long userId, NutritionLogRequest request) {
        log.info("Logging food for user ID: {}, food item ID: {}", userId, request.getFoodItemId());

        FoodItem foodItem = foodItemRepository.findById(request.getFoodItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found"));

        BigDecimal servings = request.getServings();
        BigDecimal totalCalories = foodItem.getCalories().multiply(servings);
        BigDecimal totalProtein = foodItem.getProteinG().multiply(servings);
        BigDecimal totalCarbs = foodItem.getCarbsG().multiply(servings);
        BigDecimal totalFat = foodItem.getFatG().multiply(servings);

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

    @Transactional(readOnly = true)
    public DailyNutritionSummary getDailySummary(Long userId, LocalDate date) {
        log.info("Getting daily nutrition summary for user ID: {} on date: {}", userId, date);

        UserProfile profile = profileRepository.findByUserId(userId).orElse(null);
        BigDecimal currentWeight = dailyStatsRepository.findRecentWeightLogs(userId).stream()
                .findFirst()
                .map(stat -> stat.getWeightKg())
                .orElse(null);

        double targetCalories = nutritionCalculator.targetCalories(profile, currentWeight);
        double targetProtein = nutritionCalculator.targetProteinGrams(targetCalories);
        double targetCarbs = nutritionCalculator.targetCarbsGrams(targetCalories);
        double targetFat = nutritionCalculator.targetFatGrams(targetCalories);

        List<NutritionLog> logs = nutritionLogRepository.findByUserIdAndLogDateOrderByLoggedAtAsc(userId, date);

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

        DailyNutritionSummary summary = new DailyNutritionSummary();
        summary.setDate(date);
        summary.setTargetCalories(targetCalories);
        summary.setTargetProtein(targetProtein);
        summary.setTargetCarbs(targetCarbs);
        summary.setTargetFat(targetFat);
        summary.setConsumedCalories(consumedCalories);
        summary.setConsumedProtein(consumedProtein);
        summary.setConsumedCarbs(consumedCarbs);
        summary.setConsumedFat(consumedFat);
        summary.calculateRemaining();

        List<NutritionLogResponse> logResponses = logs.stream()
                .map(NutritionLogResponse::fromEntity)
                .collect(Collectors.toList());
        summary.setLogs(logResponses);

        return summary;
    }

    @Transactional
    public void deleteNutritionLog(Long userId, Long logId) {
        log.info("Deleting nutrition log ID: {} for user ID: {}", logId, userId);
        NutritionLog entry = nutritionLogRepository.findById(logId)
                .orElseThrow(() -> new ResourceNotFoundException("Nutrition log not found"));
        if (!entry.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Nutrition log not found");
        }
        nutritionLogRepository.delete(entry);
    }

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
}
