package com.fittrack.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Body Metrics Request
 * For logging body measurements
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BodyMetricsRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Weight is required")
    @Positive(message = "Weight must be positive")
    private Double weightKg;

    private Double bodyFatPercentage;
    private Double muscleMassKg;
    private Double waistCm;
    private Double chestCm;
    private Double armsCm;
    private Double legsCm;
    private String notes;
}
