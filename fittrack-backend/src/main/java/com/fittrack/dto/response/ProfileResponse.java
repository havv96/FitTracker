package com.fittrack.dto.response;

import com.fittrack.model.UserProfile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {

    private Long id;
    private Long userId;
    private BigDecimal heightCm;
    private LocalDate dateOfBirth;
    private UserProfile.Gender gender;
    private UserProfile.ActivityLevel activityLevel;
    private UserProfile.WeightGoal weightGoal;
    private BigDecimal targetWeightKg;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private MetricsCalculation calculations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MetricsCalculation {
        private double bmr;
        private double tdee;
        private double recommendedCalories;
        private MacroTargets macroTargets;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class MacroTargets {
            private double protein;
            private double carbs;
            private double fat;
        }
    }
}
