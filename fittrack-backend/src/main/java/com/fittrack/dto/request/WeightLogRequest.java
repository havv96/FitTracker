package com.fittrack.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeightLogRequest {

    @NotNull(message = "Weight is required")
    @DecimalMin(value = "20.0", message = "Weight must be at least 20kg")
    @DecimalMax(value = "300.0", message = "Weight cannot exceed 300kg")
    private BigDecimal weightKg;

    private LocalDate date;

    private String notes;
}
