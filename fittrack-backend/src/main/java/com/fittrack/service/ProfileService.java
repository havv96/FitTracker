package com.fittrack.service;

import com.fittrack.dto.request.ProfileRequest;
import com.fittrack.dto.response.ProfileResponse;
import com.fittrack.exception.ResourceNotFoundException;
import com.fittrack.model.User;
import com.fittrack.model.UserProfile;
import com.fittrack.repository.UserProfileRepository;
import com.fittrack.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Period;

@Service
@Slf4j
public class ProfileService {

    @Autowired
    private UserProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create or update user profile
     * US-03: Physical Data Setup
     * US-04: Goals and Planning
     */
    @Transactional
    public ProfileResponse createOrUpdateProfile(Long userId, ProfileRequest request) {
        log.info("Creating/updating profile for user ID: {}", userId);

        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Find or create profile
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElse(UserProfile.builder().user(user).build());

        // AC: Update profile fields
        profile.setHeightCm(request.getHeightCm());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setGender(request.getGender());
        profile.setActivityLevel(request.getActivityLevel());
        profile.setWeightGoal(request.getWeightGoal());
        profile.setTargetWeightKg(request.getTargetWeightKg());

        profile = profileRepository.save(profile);
        log.info("Profile saved successfully for user ID: {}", userId);

        // AC: Calculate BMR, TDEE, and recommended calories
        ProfileResponse.MetricsCalculation calculations = calculateMetrics(
                request.getCurrentWeightKg(),
                request.getHeightCm(),
                request.getDateOfBirth(),
                request.getGender(),
                request.getActivityLevel(),
                request.getWeightGoal()
        );

        // Build response
        return ProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .heightCm(profile.getHeightCm())
                .dateOfBirth(profile.getDateOfBirth())
                .gender(profile.getGender())
                .activityLevel(profile.getActivityLevel())
                .weightGoal(profile.getWeightGoal())
                .targetWeightKg(profile.getTargetWeightKg())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .calculations(calculations)
                .build();
    }

    /**
     * Get user profile
     */
    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId, BigDecimal currentWeight) {
        log.info("Fetching profile for user ID: {}", userId);

        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user"));

        // Calculate metrics
        ProfileResponse.MetricsCalculation calculations = calculateMetrics(
                currentWeight,
                profile.getHeightCm(),
                profile.getDateOfBirth(),
                profile.getGender(),
                profile.getActivityLevel(),
                profile.getWeightGoal()
        );

        return ProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .heightCm(profile.getHeightCm())
                .dateOfBirth(profile.getDateOfBirth())
                .gender(profile.getGender())
                .activityLevel(profile.getActivityLevel())
                .weightGoal(profile.getWeightGoal())
                .targetWeightKg(profile.getTargetWeightKg())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .calculations(calculations)
                .build();
    }

    /**
     * Calculate BMR, TDEE, and recommended calories
     * Formula: Mifflin-St Jeor
     */
    private ProfileResponse.MetricsCalculation calculateMetrics(
            BigDecimal currentWeight,
            BigDecimal height,
            LocalDate dateOfBirth,
            UserProfile.Gender gender,
            UserProfile.ActivityLevel activityLevel,
            UserProfile.WeightGoal weightGoal) {

        // Calculate age
        int age = Period.between(dateOfBirth, LocalDate.now()).getYears();

        // Calculate BMR using Mifflin-St Jeor formula
        double weightKg = currentWeight.doubleValue();
        double heightCm = height.doubleValue();
        double bmr;

        if (gender == UserProfile.Gender.MALE) {
            // Male: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
            bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
        } else {
            // Female: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
            bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
        }

        // Calculate TDEE (Total Daily Energy Expenditure)
        double activityMultiplier = getActivityMultiplier(activityLevel);
        double tdee = bmr * activityMultiplier;

        // Calculate recommended calories based on weight goal
        double recommendedCalories = calculateRecommendedCalories(tdee, weightGoal);

        // Calculate macro targets (30% protein, 40% carbs, 30% fat)
        double proteinGrams = (recommendedCalories * 0.30) / 4; // 4 cal/g
        double carbsGrams = (recommendedCalories * 0.40) / 4;   // 4 cal/g
        double fatGrams = (recommendedCalories * 0.30) / 9;     // 9 cal/g

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
     * Get activity multiplier for TDEE calculation
     */
    private double getActivityMultiplier(UserProfile.ActivityLevel activityLevel) {
        return switch (activityLevel) {
            case SEDENTARY -> 1.2;
            case LIGHTLY_ACTIVE -> 1.375;
            case MODERATELY_ACTIVE -> 1.55;
            case VERY_ACTIVE -> 1.725;
            case EXTRA_ACTIVE -> 1.9;
        };
    }

    /**
     * Calculate recommended calories based on weight goal
     */
    private double calculateRecommendedCalories(double tdee, UserProfile.WeightGoal weightGoal) {
        return switch (weightGoal) {
            case LOSE_SLOW -> tdee - 250;      // 0.25 kg/week
            case LOSE_MODERATE -> tdee - 500;  // 0.5 kg/week
            case LOSE_FAST -> tdee - 750;      // 0.75 kg/week
            case MAINTAIN -> tdee;
            case GAIN_SLOW -> tdee + 250;      // 0.25 kg/week
            case GAIN_MODERATE -> tdee + 500;  // 0.5 kg/week
        };
    }

    /**
     * Round to specified decimal places
     */
    private double round(double value, int places) {
        return BigDecimal.valueOf(value)
                .setScale(places, RoundingMode.HALF_UP)
                .doubleValue();
    }
}
