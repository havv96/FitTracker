package com.fittrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Analytics Summary Response
 * Comprehensive overview of user's fitness progress
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryResponse {
    private Integer totalWorkouts;
    private Double totalVolume;
    private Integer avgWorkoutDuration;
    private Integer consistencyStreak;
    private Integer bestStreak;
    private Double calorieCompliance;
    private Double proteinCompliance;
    private List<PersonalRecordResponse> personalRecords;
    private List<WeeklyProgressResponse> recentProgress;
    private List<BodyMetricsResponse> bodyMetrics;
}
