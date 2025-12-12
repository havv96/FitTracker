package com.fittrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Personal Record Response
 * Best performance for an exercise
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
    private LocalDate achievedDate;
}
