package com.fittrack.dto.request;

import com.fittrack.model.UserProfile;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileRequest {

    @NotNull(message = "Height is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Height must be greater than 0")
    private BigDecimal heightCm;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @NotNull(message = "Gender is required")
    private UserProfile.Gender gender;

    @NotNull(message = "Activity level is required")
    private UserProfile.ActivityLevel activityLevel;

    @NotNull(message = "Weight goal is required")
    private UserProfile.WeightGoal weightGoal;

    @NotNull(message = "Target weight is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Target weight must be greater than 0")
    private BigDecimal targetWeightKg;

    @NotNull(message = "Current weight is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Current weight must be greater than 0")
    private BigDecimal currentWeightKg;
}
