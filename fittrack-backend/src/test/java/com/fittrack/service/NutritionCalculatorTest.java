package com.fittrack.service;

import com.fittrack.dto.response.ProfileResponse;
import com.fittrack.model.UserProfile;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class NutritionCalculatorTest {

    private final NutritionCalculator calculator = new NutritionCalculator();

    @Test
    void male_moderatelyActive_maintain_bmrAndTdeeAndMacros() {
        // 30-year-old male, 180cm, 80kg, moderately active, maintain
        LocalDate dob = LocalDate.now().minusYears(30);
        ProfileResponse.MetricsCalculation result = calculator.calculateMetrics(
                new BigDecimal("80"),
                new BigDecimal("180"),
                dob,
                UserProfile.Gender.MALE,
                UserProfile.ActivityLevel.MODERATELY_ACTIVE,
                UserProfile.WeightGoal.MAINTAIN);

        // Mifflin: (10*80) + (6.25*180) - (5*30) + 5 = 800 + 1125 - 150 + 5 = 1780
        assertEquals(1780.0, result.getBmr(), 0.1);
        // TDEE = 1780 * 1.55 = 2759
        assertEquals(2759.0, result.getTdee(), 0.1);
        // Maintain — recommendedCalories == tdee
        assertEquals(2759.0, result.getRecommendedCalories(), 0.1);
        // Protein at 30% / 4 = 206.925g
        assertEquals(206.9, result.getMacroTargets().getProtein(), 0.2);
    }

    @Test
    void female_sedentary_loseModerate_appliesDeficit() {
        LocalDate dob = LocalDate.now().minusYears(25);
        ProfileResponse.MetricsCalculation result = calculator.calculateMetrics(
                new BigDecimal("65"),
                new BigDecimal("165"),
                dob,
                UserProfile.Gender.FEMALE,
                UserProfile.ActivityLevel.SEDENTARY,
                UserProfile.WeightGoal.LOSE_MODERATE);

        // Female: (10*65) + (6.25*165) - (5*25) - 161 = 650 + 1031.25 - 125 - 161 = 1395.25
        assertEquals(1395.25, result.getBmr(), 0.1);
        double tdee = 1395.25 * 1.2;
        assertEquals(tdee - 500, result.getRecommendedCalories(), 0.1);
    }

    @Test
    void targetCalories_nullProfile_returnsFallback() {
        assertEquals(NutritionCalculator.FALLBACK_CALORIES,
                calculator.targetCalories(null, new BigDecimal("70")));
    }

    @Test
    void targetCalories_nullWeight_returnsFallback() {
        UserProfile profile = UserProfile.builder()
                .heightCm(new BigDecimal("170"))
                .dateOfBirth(LocalDate.now().minusYears(30))
                .gender(UserProfile.Gender.MALE)
                .activityLevel(UserProfile.ActivityLevel.SEDENTARY)
                .weightGoal(UserProfile.WeightGoal.MAINTAIN)
                .build();
        assertEquals(NutritionCalculator.FALLBACK_CALORIES,
                calculator.targetCalories(profile, null));
    }

    @Test
    void targetCalories_completeProfile_returnsRealTdee() {
        UserProfile profile = UserProfile.builder()
                .heightCm(new BigDecimal("180"))
                .dateOfBirth(LocalDate.now().minusYears(30))
                .gender(UserProfile.Gender.MALE)
                .activityLevel(UserProfile.ActivityLevel.MODERATELY_ACTIVE)
                .weightGoal(UserProfile.WeightGoal.MAINTAIN)
                .build();
        double result = calculator.targetCalories(profile, new BigDecimal("80"));
        assertNotEquals(NutritionCalculator.FALLBACK_CALORIES, result);
        assertEquals(2759.0, result, 0.5);
    }

    @Test
    void macroGramConversions() {
        double calories = 2000.0;
        // 30% of 2000 / 4 = 150
        assertEquals(150.0, calculator.targetProteinGrams(calories), 0.01);
        // 40% of 2000 / 4 = 200
        assertEquals(200.0, calculator.targetCarbsGrams(calories), 0.01);
        // 30% of 2000 / 9 = 66.66..
        assertEquals(66.67, calculator.targetFatGrams(calories), 0.01);
    }
}
