package com.fittrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeightTrendResponse {

    private List<WeightDataPoint> dataPoints;
    private BigDecimal currentWeight;
    private BigDecimal startWeight;
    private BigDecimal change;
    private Double changePercentage;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeightDataPoint {
        private LocalDate date;
        private BigDecimal weight;
    }
}
