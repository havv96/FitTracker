package com.fittrack.service;

import com.fittrack.dto.request.ProfileRequest;
import com.fittrack.dto.response.ProfileResponse;
import com.fittrack.exception.ResourceNotFoundException;
import com.fittrack.model.UserProfile;
import com.fittrack.repository.DailyStatsRepository;
import com.fittrack.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProfileService {

    private final UserProfileRepository profileRepository;
    private final DailyStatsRepository dailyStatsRepository;
    private final NutritionCalculator nutritionCalculator;

    @Transactional
    public ProfileResponse createOrUpdateProfile(Long userId, ProfileRequest request) {
        log.info("Creating/updating profile for user ID: {}", userId);

        UserProfile profile = profileRepository.findByUserId(userId)
                .orElse(UserProfile.builder().userId(userId).build());

        profile.setHeightCm(request.getHeightCm());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setGender(request.getGender());
        profile.setActivityLevel(request.getActivityLevel());
        profile.setWeightGoal(request.getWeightGoal());
        profile.setTargetWeightKg(request.getTargetWeightKg());

        profile = profileRepository.save(profile);
        log.info("Profile saved successfully for user ID: {}", userId);

        ProfileResponse.MetricsCalculation calculations = null;
        if (request.getCurrentWeightKg() != null) {
            calculations = nutritionCalculator.calculateMetrics(
                    request.getCurrentWeightKg(),
                    request.getHeightCm(),
                    request.getDateOfBirth(),
                    request.getGender(),
                    request.getActivityLevel(),
                    request.getWeightGoal()
            );
        }

        return toResponse(profile, calculations);
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId) {
        log.info("Fetching profile for user ID: {}", userId);

        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user"));

        BigDecimal currentWeight = latestLoggedWeight(userId);
        ProfileResponse.MetricsCalculation calculations = null;
        if (currentWeight != null) {
            calculations = nutritionCalculator.calculateMetrics(
                    currentWeight,
                    profile.getHeightCm(),
                    profile.getDateOfBirth(),
                    profile.getGender(),
                    profile.getActivityLevel(),
                    profile.getWeightGoal()
            );
        }

        return toResponse(profile, calculations);
    }

    private BigDecimal latestLoggedWeight(Long userId) {
        return dailyStatsRepository.findRecentWeightLogs(userId).stream()
                .findFirst()
                .map(stat -> stat.getWeightKg())
                .orElse(null);
    }

    private ProfileResponse toResponse(UserProfile profile, ProfileResponse.MetricsCalculation calculations) {
        return ProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUserId())
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
}
