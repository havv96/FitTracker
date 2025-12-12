package com.fittrack.repository;

import com.fittrack.model.Workout;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutRepository extends JpaRepository<Workout, Long> {

    List<Workout> findByUserIdAndWorkoutDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    Page<Workout> findByUserIdOrderByWorkoutDateDesc(Long userId, Pageable pageable);

    Optional<Workout> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT w FROM Workout w WHERE w.userId = :userId AND w.endTime IS NULL ORDER BY w.startTime DESC")
    Optional<Workout> findActiveWorkout(@Param("userId") Long userId);

    @Query("SELECT COUNT(w) FROM Workout w WHERE w.userId = :userId AND w.workoutDate >= :startDate")
    Long countUserWorkoutsSince(@Param("userId") Long userId, @Param("startDate") LocalDate startDate);

    Long countByUserIdAndWorkoutDateAfter(Long userId, LocalDate date);

    Long countByUserId(Long userId);

    Optional<Workout> findTopByUserIdOrderByWorkoutDateDesc(Long userId);

    List<Workout> findByUserId(Long userId);

    List<Workout> findTop30ByUserIdOrderByWorkoutDateDesc(Long userId);

    List<Workout> findByUserIdOrderByWorkoutDateAsc(Long userId);

    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 60) FROM workouts WHERE user_id = :userId AND start_time IS NOT NULL AND end_time IS NOT NULL", nativeQuery = true)
    Double getAverageWorkoutDuration(@Param("userId") Long userId);
}
