package com.fittrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Body Metrics Response
 * Body measurements and composition data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BodyMetricsResponse {
    private Long id;
    private Long userId;
    private LocalDate date;
    private Double weightKg;
    private Double bodyFatPercentage;
    private Double muscleMassKg;
    private Double waistCm;
    private Double chestCm;
    private Double armsCm;
    private Double legsCm;
    private String notes;
}
