package com.fittrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {

    // Today's metrics
    private Integer waterMl;
    private Integer waterTarget;

    // Workout stats
    private Long workoutsThisWeek;
    private Long totalWorkouts;

    // Nutrition today
    private Double caloriesConsumed;
    private Double caloriesTarget;
    private Double proteinConsumed;
    private Double proteinTarget;

    // Weight
    private BigDecimal currentWeight;
    private BigDecimal targetWeight;
    private BigDecimal weightChange;
}
