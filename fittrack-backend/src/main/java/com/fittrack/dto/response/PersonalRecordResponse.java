package com.fittrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Personal Record Response
 * Best performance for an exercise, ranked by Epley estimated 1RM.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonalRecordResponse {
    private String exerciseName;
    private Double bestWeight;
    private Double bestVolume;
    private Integer bestReps;
    /** Epley estimated one-rep max: weight * (1 + reps/30). */
    private Double bestE1RM;
    private LocalDate achievedDate;
}
