package com.fittrack.service;

import com.fittrack.dto.request.WorkoutSetRequest;
import com.fittrack.dto.request.WorkoutStartRequest;
import com.fittrack.dto.response.*;
import com.fittrack.exception.ActiveWorkoutExistsException;
import com.fittrack.exception.ExerciseNotFoundException;
import com.fittrack.exception.WorkoutNotFoundException;
import com.fittrack.model.Exercise;
import com.fittrack.model.Workout;
import com.fittrack.model.WorkoutSet;
import com.fittrack.repository.ExerciseRepository;
import com.fittrack.repository.WorkoutRepository;
import com.fittrack.repository.WorkoutSetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final WorkoutSetRepository setRepository;
    private final ExerciseRepository exerciseRepository;

    @Transactional
    public WorkoutResponse startWorkout(Long userId, WorkoutStartRequest request) {
        log.info("Starting workout for user {}", userId);

        workoutRepository.findActiveWorkout(userId).ifPresent(active -> {
            throw new ActiveWorkoutExistsException(
                    "An active workout already exists (id=" + active.getId() + "). Finish it before starting a new one.");
        });

        Workout workout = new Workout();
        workout.setUserId(userId);
        workout.setWorkoutDate(request.getDate());
        workout.setStartTime(LocalDateTime.now());
        workout.setNotes(request.getNotes());
        workout.setTotalVolume(BigDecimal.ZERO);

        workout = workoutRepository.save(workout);
        log.info("Workout {} created for user {}", workout.getId(), userId);

        return new WorkoutResponse(workout);
    }

    @Transactional
    public WorkoutSetResponse logSet(Long workoutId, WorkoutSetRequest request, Long userId) {
        log.info("Logging set for workout {}: exercise={}, reps={}, weight={}",
            workoutId, request.getExerciseId(), request.getReps(), request.getWeightKg());

        // Validate workout exists and belongs to user
        Workout workout = workoutRepository.findByIdAndUserId(workoutId, userId)
                .orElseThrow(() -> new WorkoutNotFoundException("Workout not found or access denied"));

        // Validate exercise exists
        Exercise exercise = exerciseRepository.findById(request.getExerciseId())
                .orElseThrow(() -> new ExerciseNotFoundException("Exercise not found with id: " + request.getExerciseId()));

        // Create workout set
        WorkoutSet set = new WorkoutSet();
        set.setWorkout(workout);
        set.setExercise(exercise);
        set.setSetNumber(request.getSetNumber());
        set.setReps(request.getReps());
        set.setWeightKg(request.getWeightKg());
        set.setRpe(request.getRpe());
        set.setNotes(request.getNotes());
        set.setCompletedAt(LocalDateTime.now());

        set = setRepository.save(set);

        // Calculate volume load
        double volumeLoad = request.getReps() * request.getWeightKg().doubleValue();
        log.info("Set {} logged with volume load {}", set.getId(), volumeLoad);

        return new WorkoutSetResponse(set, volumeLoad);
    }

    @Transactional
    public WorkoutResponse finishWorkout(Long workoutId, Long userId) {
        log.info("Finishing workout {} for user {}", workoutId, userId);

        Workout workout = workoutRepository.findByIdAndUserId(workoutId, userId)
                .orElseThrow(() -> new WorkoutNotFoundException("Workout not found or access denied"));

        workout.setEndTime(LocalDateTime.now());

        // Calculate total volume
        List<WorkoutSet> sets = setRepository.findByWorkoutIdOrderBySetNumberAsc(workoutId);
        double totalVolume = sets.stream()
                .mapToDouble(s -> s.getReps() * s.getWeightKg().doubleValue())
                .sum();

        workout.setTotalVolume(BigDecimal.valueOf(totalVolume));
        workout = workoutRepository.save(workout);

        log.info("Workout {} finished with total volume {}", workoutId, totalVolume);

        return new WorkoutResponse(workout);
    }

    @Transactional(readOnly = true)
    public List<WorkoutHistoryResponse> getWorkoutHistory(Long userId, LocalDate startDate, LocalDate endDate) {
        log.info("Fetching workout history for user {} from {} to {}", userId, startDate, endDate);

        List<Workout> workouts = workoutRepository.findByUserIdAndWorkoutDateBetween(userId, startDate, endDate);

        return workouts.stream()
                .map(workout -> {
                    // Sets are eagerly loaded via @EntityGraph on the repository method.
                    int uniqueExercises = (int) workout.getSets().stream()
                            .map(set -> set.getExercise().getId())
                            .distinct()
                            .count();

                    return new WorkoutHistoryResponse(workout, uniqueExercises);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkoutDetailResponse getWorkoutDetail(Long workoutId, Long userId) {
        log.info("Fetching workout detail for workout {} and user {}", workoutId, userId);

        Workout workout = workoutRepository.findByIdAndUserId(workoutId, userId)
                .orElseThrow(() -> new WorkoutNotFoundException("Workout not found or access denied"));

        List<WorkoutSet> sets = setRepository.findByWorkoutIdOrderBySetNumberAsc(workoutId);

        return new WorkoutDetailResponse(workout, sets);
    }

    @Transactional(readOnly = true)
    public WorkoutDetailResponse getActiveWorkout(Long userId) {
        log.info("Fetching active workout for user {}", userId);

        return workoutRepository.findActiveWorkout(userId)
                .map(workout -> new WorkoutDetailResponse(
                        workout,
                        setRepository.findByWorkoutIdOrderBySetNumberAsc(workout.getId())))
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<WorkoutSetResponse> getPreviousWorkoutData(Long userId, Long exerciseId, Long currentWorkoutId) {
        log.info("Fetching previous workout data for user {}, exercise {}", userId, exerciseId);

        List<WorkoutSet> previousSets = setRepository.findPreviousSetsByUserAndExercise(userId, exerciseId, currentWorkoutId);

        return previousSets.stream()
                .map(WorkoutSetResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<Exercise> searchExercises(String muscleGroup, String equipmentType, String searchTerm, Pageable pageable) {
        log.info("Searching exercises: muscle={}, equipment={}, search={}", muscleGroup, equipmentType, searchTerm);

        return exerciseRepository.searchExercises(muscleGroup, equipmentType, searchTerm, pageable);
    }

    @Transactional(readOnly = true)
    public Exercise getExerciseById(Long exerciseId) {
        return exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ExerciseNotFoundException("Exercise not found with id: " + exerciseId));
    }

    @Transactional(readOnly = true)
    public List<Exercise> getAllExercises() {
        return exerciseRepository.findAll();
    }
}
