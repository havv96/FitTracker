package com.fittrack.controller;

import com.fittrack.dto.request.ProfileRequest;
import com.fittrack.dto.response.ProfileResponse;
import com.fittrack.security.SecurityUtils;
import com.fittrack.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@Slf4j
@RequiredArgsConstructor
@Tag(name = "Profile", description = "User profile management: physical data, goals, and personalized calculations")
@SecurityRequirement(name = "bearerAuth")
public class ProfileController {

    private final ProfileService profileService;

    @Operation(summary = "Create or update profile", description = "Set up physical data and fitness goals. Calculates BMR, TDEE, and calorie targets (US-03, US-04)")
    @PostMapping
    public ResponseEntity<ProfileResponse> createOrUpdateProfile(@Valid @RequestBody ProfileRequest request) {
        Long userId = SecurityUtils.currentUserId();
        log.info("POST /api/v1/profile - Creating/updating profile for user ID: {}", userId);
        return ResponseEntity.ok(profileService.createOrUpdateProfile(userId, request));
    }

    @Operation(summary = "Get user profile",
            description = "Retrieves profile with calculated metrics (BMR, TDEE, calorie targets). " +
                          "Calculations are null when no weight has been logged yet.")
    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile() {
        Long userId = SecurityUtils.currentUserId();
        log.info("GET /api/v1/profile - Fetching profile for user ID: {}", userId);
        return ResponseEntity.ok(profileService.getProfile(userId));
    }
}
