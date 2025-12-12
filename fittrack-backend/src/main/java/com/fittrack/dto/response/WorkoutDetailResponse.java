package com.fittrack.dto.response;

import com.fittrack.model.Workout;
import com.fittrack.model.WorkoutSet;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutDetailResponse {

    private Long id;
    private Long userId;
    private LocalDate workoutDate;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String notes;
    private BigDecimal totalVolume;
    private Long durationMinutes;
    private List<WorkoutSetResponse> sets;

    public WorkoutDetailResponse(Workout workout, List<WorkoutSet> sets) {
        this.id = workout.getId();
        this.userId = workout.getUserId();
        this.workoutDate = workout.getWorkoutDate();
        this.startTime = workout.getStartTime();
        this.endTime = workout.getEndTime();
        this.notes = workout.getNotes();
        this.totalVolume = workout.getTotalVolume();

        if (workout.getStartTime() != null && workout.getEndTime() != null) {
            this.durationMinutes = java.time.Duration.between(
                workout.getStartTime(),
                workout.getEndTime()
            ).toMinutes();
        }

        this.sets = sets.stream()
            .map(WorkoutSetResponse::new)
            .collect(Collectors.toList());
    }
}
