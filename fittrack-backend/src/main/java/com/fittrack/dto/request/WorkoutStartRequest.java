package com.fittrack.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutStartRequest {

    @NotNull(message = "Workout date is required")
    private LocalDate date;

    private String notes;
}
