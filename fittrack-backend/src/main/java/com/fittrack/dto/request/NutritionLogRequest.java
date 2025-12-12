package com.fittrack.dto.request;

import com.fittrack.model.NutritionLog;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NutritionLogRequest {

    @NotNull(message = "Food item ID is required")
    private Long foodItemId;

    @NotNull(message = "Log date is required")
    private LocalDate logDate;

    @NotNull(message = "Meal type is required")
    private NutritionLog.MealType mealType;

    @NotNull(message = "Servings is required")
    @DecimalMin(value = "0.01", message = "Servings must be greater than 0")
    private BigDecimal servings;

    private String notes;
}
