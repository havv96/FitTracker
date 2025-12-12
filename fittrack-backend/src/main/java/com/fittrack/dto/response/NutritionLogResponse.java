package com.fittrack.dto.response;

import com.fittrack.model.FoodItem;
import com.fittrack.model.NutritionLog;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NutritionLogResponse {

    private Long id;
    private Long foodItemId;
    private String foodName;
    private String brand;
    private LocalDate logDate;
    private NutritionLog.MealType mealType;
    private BigDecimal servings;
    private BigDecimal totalCalories;
    private BigDecimal totalProteinG;
    private BigDecimal totalCarbsG;
    private BigDecimal totalFatG;
    private String notes;
    private LocalDateTime loggedAt;

    public static NutritionLogResponse fromEntity(NutritionLog log) {
        NutritionLogResponse response = new NutritionLogResponse();
        response.setId(log.getId());
        response.setFoodItemId(log.getFoodItem().getId());
        response.setFoodName(log.getFoodItem().getName());
        response.setBrand(log.getFoodItem().getBrand());
        response.setLogDate(log.getLogDate());
        response.setMealType(log.getMealType());
        response.setServings(log.getServings());
        response.setTotalCalories(log.getTotalCalories());
        response.setTotalProteinG(log.getTotalProteinG());
        response.setTotalCarbsG(log.getTotalCarbsG());
        response.setTotalFatG(log.getTotalFatG());
        response.setNotes(log.getNotes());
        response.setLoggedAt(log.getLoggedAt());
        return response;
    }
}
