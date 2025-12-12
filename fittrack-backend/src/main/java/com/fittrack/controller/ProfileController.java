package com.fittrack.controller;

import com.fittrack.dto.request.ProfileRequest;
import com.fittrack.dto.response.ProfileResponse;
import com.fittrack.exception.ResourceNotFoundException;
import com.fittrack.model.User;
import com.fittrack.repository.UserRepository;
import com.fittrack.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/profile")
@Slf4j
@Tag(name = "Profile", description = "User profile management: physical data, goals, and personalized calculations")
@SecurityRequirement(name = "bearerAuth")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create or update user profile
     * POST /api/v1/profile
     * US-03: Physical Data Setup
     * US-04: Goals and Planning
     */
    @Operation(summary = "Create or update profile", description = "Set up physical data and fitness goals. Calculates BMR, TDEE, and calorie targets (US-03, US-04)")
    @PostMapping
    public ResponseEntity<ProfileResponse> createOrUpdateProfile(@Valid @RequestBody ProfileRequest request) {
        Long userId = getCurrentUserId();
        log.info("POST /api/v1/profile - Creating/updating profile for user ID: {}", userId);

        ProfileResponse response = profileService.createOrUpdateProfile(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get user profile
     * GET /api/v1/profile
     */
    @Operation(summary = "Get user profile", description = "Retrieves profile with calculated metrics (BMR, TDEE, calorie targets)")
    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(@RequestParam(required = false) BigDecimal currentWeight) {
        Long userId = getCurrentUserId();
        log.info("GET /api/v1/profile - Fetching profile for user ID: {}", userId);

        // If no current weight provided, use a default for now (should be from daily_stats later)
        if (currentWeight == null) {
            currentWeight = BigDecimal.valueOf(70.0);
        }

        ProfileResponse response = profileService.getProfile(userId, currentWeight);
        return ResponseEntity.ok(response);
    }

    /**
     * Get current user ID from security context
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String email = userDetails.getUsername();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return user.getId();
    }
}
