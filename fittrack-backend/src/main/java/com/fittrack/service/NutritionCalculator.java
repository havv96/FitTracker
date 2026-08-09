package com.fittrack.service;

import com.fittrack.dto.response.ProfileResponse;
import com.fittrack.model.UserProfile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Period;

/**
 * Nutrition calculator — Mifflin-St Jeor BMR + activity multiplier + goal adjustment + macro split.
 * Single source of truth used by ProfileService, NutritionService, and MetricsService.
 */
@Component
public class NutritionCalculator {

    public static final double PROTEIN_RATIO = 0.30;
    public static final double CARBS_RATIO = 0.40;
    public static final double FAT_RATIO = 0.30;
    public static final double CAL_PER_G_PROTEIN = 4.0;
    public static final double CAL_PER_G_CARBS = 4.0;
    public static final double CAL_PER_G_FAT = 9.0;

    /** Used when a caller needs a target and the user's profile or weight are not available. */
    public static final double FALLBACK_CALORIES = 2000.0;
    public static final double FALLBACK_PROTEIN_G = 150.0;

    public ProfileResponse.MetricsCalculation calculateMetrics(
            BigDecimal currentWeight,
            BigDecimal height,
            LocalDate dateOfBirth,
            UserProfile.Gender gender,
            UserProfile.ActivityLevel activityLevel,
            UserProfile.WeightGoal weightGoal) {

        int age = Period.between(dateOfBirth, LocalDate.now()).getYears();
        double weightKg = currentWeight.doubleValue();
        double heightCm = height.doubleValue();
        double bmr = calculateBmr(weightKg, heightCm, age, gender);
        double tdee = bmr * getActivityMultiplier(activityLevel);
        double recommendedCalories = adjustForWeightGoal(tdee, weightGoal);

        double proteinGrams = (recommendedCalories * PROTEIN_RATIO) / CAL_PER_G_PROTEIN;
        double carbsGrams = (recommendedCalories * CARBS_RATIO) / CAL_PER_G_CARBS;
        double fatGrams = (recommendedCalories * FAT_RATIO) / CAL_PER_G_FAT;

        ProfileResponse.MetricsCalculation.MacroTargets macroTargets =
                ProfileResponse.MetricsCalculation.MacroTargets.builder()
                        .protein(round(proteinGrams, 1))
                        .carbs(round(carbsGrams, 1))
                        .fat(round(fatGrams, 1))
                        .build();

        return ProfileResponse.MetricsCalculation.builder()
                .bmr(round(bmr, 1))
                .tdee(round(tdee, 1))
                .recommendedCalories(round(recommendedCalories, 1))
                .macroTargets(macroTargets)
                .build();
    }

    /**
     * Returns the recommended daily calorie target for a user, or FALLBACK_CALORIES when any
     * required input (profile, weight, height, date of birth, or enums) is missing.
     */
    public double targetCalories(UserProfile profile, BigDecimal currentWeight) {
        if (profile == null || currentWeight == null
                || profile.getHeightCm() == null
                || profile.getDateOfBirth() == null
                || profile.getGender() == null
                || profile.getActivityLevel() == null
                || profile.getWeightGoal() == null) {
            return FALLBACK_CALORIES;
        }
        return calculateMetrics(
                currentWeight,
                profile.getHeightCm(),
                profile.getDateOfBirth(),
                profile.getGender(),
                profile.getActivityLevel(),
                profile.getWeightGoal()
        ).getRecommendedCalories();
    }

    public double targetProteinGrams(double targetCalories) {
        return (targetCalories * PROTEIN_RATIO) / CAL_PER_G_PROTEIN;
    }

    public double targetCarbsGrams(double targetCalories) {
        return (targetCalories * CARBS_RATIO) / CAL_PER_G_CARBS;
    }

    public double targetFatGrams(double targetCalories) {
        return (targetCalories * FAT_RATIO) / CAL_PER_G_FAT;
    }

    private double calculateBmr(double weightKg, double heightCm, int age, UserProfile.Gender gender) {
        if (gender == UserProfile.Gender.MALE) {
            return (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
        }
        return (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
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

    private double round(double value, int places) {
        return BigDecimal.valueOf(value)
                .setScale(places, RoundingMode.HALF_UP)
                .doubleValue();
    }
}
