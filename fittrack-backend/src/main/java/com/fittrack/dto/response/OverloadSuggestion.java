package com.fittrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Overload Suggestion DTO
 * Response for progressive overload recommendations
 * Reference: US-15, FR-AI-02
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OverloadSuggestion {

    /**
     * User-friendly message in Bulgarian
     * Example: "Опитай +72.5kg днес?"
     */
    private String message;

    /**
     * Suggested weight increase (in kg)
     */
    private BigDecimal suggestedWeight;

    /**
     * Explanation for the suggestion
     * Example: "Последния път беше с RPE 6 - време е за прогрес!"
     */
    private String reason;

    /**
     * Type of progression suggested
     * WEIGHT_INCREASE, REP_INCREASE, SET_INCREASE
     */
    private ProgressionType progressionType;

    /**
     * Previous workout performance for context
     */
    private Integer previousReps;
    private BigDecimal previousWeight;
    private Integer previousRpe;

    public enum ProgressionType {
        WEIGHT_INCREASE,
        REP_INCREASE,
        SET_INCREASE
    }
}
