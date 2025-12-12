package com.fittrack.dto.response;

import com.fittrack.model.WorkoutSet;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutSetResponse {

    private Long id;
    private Long workoutId;
    private Long exerciseId;
    private String exerciseName;
    private Integer setNumber;
    private Integer reps;
    private BigDecimal weightKg;
    private Integer rpe;
    private String notes;
    private Double volumeLoad;
    private LocalDateTime completedAt;

    public WorkoutSetResponse(WorkoutSet set) {
        this.id = set.getId();
        this.workoutId = set.getWorkout().getId();
        this.exerciseId = set.getExercise().getId();
        this.exerciseName = set.getExercise().getName();
        this.setNumber = set.getSetNumber();
        this.reps = set.getReps();
        this.weightKg = set.getWeightKg();
        this.rpe = set.getRpe();
        this.notes = set.getNotes();
        this.volumeLoad = set.getReps() * set.getWeightKg().doubleValue();
        this.completedAt = set.getCompletedAt();
    }

    public WorkoutSetResponse(WorkoutSet set, Double volumeLoad) {
        this(set);
        this.volumeLoad = volumeLoad;
    }
}
