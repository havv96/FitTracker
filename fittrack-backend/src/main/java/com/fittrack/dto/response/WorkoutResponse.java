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
public class WorkoutResponse {

    private Long id;
    private Long userId;
    private LocalDate workoutDate;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String notes;
    private BigDecimal totalVolume;
    private Integer totalSets;
    private Long durationMinutes;

    public WorkoutResponse(Workout workout) {
        this.id = workout.getId();
        this.userId = workout.getUserId();
        this.workoutDate = workout.getWorkoutDate();
        this.startTime = workout.getStartTime();
        this.endTime = workout.getEndTime();
        this.notes = workout.getNotes();
        this.totalVolume = workout.getTotalVolume();
        this.totalSets = workout.getSets() != null ? workout.getSets().size() : 0;

        if (workout.getStartTime() != null && workout.getEndTime() != null) {
            this.durationMinutes = java.time.Duration.between(
                workout.getStartTime(),
                workout.getEndTime()
            ).toMinutes();
        }
    }
}
