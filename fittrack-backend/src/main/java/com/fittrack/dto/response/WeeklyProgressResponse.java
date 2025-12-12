package com.fittrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Weekly Progress Response
 * Summary of workout and nutrition metrics for a week
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyProgressResponse {
    private LocalDate weekStartDate;
    private Integer workoutCount;
    private Double totalVolume;
    private Integer avgWorkoutDuration;
    private Integer caloriesConsumed;
    private Integer avgDailyCalories;
    private Double complianceRate;
}
