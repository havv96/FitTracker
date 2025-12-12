package com.fittrack.dto.response;

import com.fittrack.model.Workout;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutHistoryResponse {

    private Long id;
    private LocalDate workoutDate;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal totalVolume;
    private Integer totalSets;
    private Integer totalExercises;
    private Long durationMinutes;

    public WorkoutHistoryResponse(Workout workout, Integer totalExercises) {
        this.id = workout.getId();
        this.workoutDate = workout.getWorkoutDate();
        this.startTime = workout.getStartTime();
        this.endTime = workout.getEndTime();
        this.totalVolume = workout.getTotalVolume();
        this.totalSets = workout.getSets() != null ? workout.getSets().size() : 0;
        this.totalExercises = totalExercises;

        if (workout.getStartTime() != null && workout.getEndTime() != null) {
            this.durationMinutes = java.time.Duration.between(
                workout.getStartTime(),
                workout.getEndTime()
            ).toMinutes();
        }
    }
}
