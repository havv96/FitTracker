package com.fittrack.repository;

import com.fittrack.model.WorkoutSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutSetRepository extends JpaRepository<WorkoutSet, Long> {

    List<WorkoutSet> findByWorkoutIdOrderBySetNumberAsc(Long workoutId);

    @Query("SELECT ws FROM WorkoutSet ws " +
           "WHERE ws.workout.id IN " +
           "(SELECT w.id FROM Workout w WHERE w.userId = :userId AND w.id < :currentWorkoutId) " +
           "AND ws.exercise.id = :exerciseId " +
           "ORDER BY ws.completedAt DESC")
    List<WorkoutSet> findPreviousSetsByUserAndExercise(
        @Param("userId") Long userId,
        @Param("exerciseId") Long exerciseId,
        @Param("currentWorkoutId") Long currentWorkoutId
    );

    @Query("SELECT ws FROM WorkoutSet ws " +
           "JOIN ws.workout w " +
           "WHERE w.userId = :userId AND ws.exercise.id = :exerciseId " +
           "ORDER BY ws.completedAt DESC")
    List<WorkoutSet> findLastWorkoutForExercise(
        @Param("userId") Long userId,
        @Param("exerciseId") Long exerciseId
    );

    void deleteByWorkoutId(Long workoutId);

    @Query("SELECT SUM(ws.weightKg * ws.reps) FROM WorkoutSet ws " +
           "JOIN ws.workout w " +
           "WHERE w.userId = :userId")
    Double getTotalVolumeByUserId(@Param("userId") Long userId);
}
