package com.fittrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyNutritionSummary {

    private LocalDate date;

    // Targets
    private Double targetCalories;
    private Double targetProtein;
    private Double targetCarbs;
    private Double targetFat;

    // Consumed
    private Double consumedCalories;
    private Double consumedProtein;
    private Double consumedCarbs;
    private Double consumedFat;

    // Remaining
    private Double remainingCalories;
    private Double remainingProtein;
    private Double remainingCarbs;
    private Double remainingFat;

    // Logs for the day
    private List<NutritionLogResponse> logs;

    public void calculateRemaining() {
        this.remainingCalories = targetCalories - consumedCalories;
        this.remainingProtein = targetProtein - consumedProtein;
        this.remainingCarbs = targetCarbs - consumedCarbs;
        this.remainingFat = targetFat - consumedFat;
    }
}
