package com.fittrack.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WaterIntakeRequest {

    @NotNull(message = "Water amount is required")
    @Min(value = 1, message = "Water amount must be at least 1ml")
    @Max(value = 5000, message = "Water amount cannot exceed 5000ml per entry")
    private Integer milliliters;
}
