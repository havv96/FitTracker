package com.fittrack.service;

import com.fittrack.dto.request.WorkoutSetRequest;
import com.fittrack.dto.request.WorkoutStartRequest;
import com.fittrack.dto.response.WorkoutDetailResponse;
import com.fittrack.dto.response.WorkoutHistoryResponse;
import com.fittrack.dto.response.WorkoutResponse;
import com.fittrack.dto.response.WorkoutSetResponse;
import com.fittrack.exception.ActiveWorkoutExistsException;
import com.fittrack.exception.ExerciseNotFoundException;
import com.fittrack.exception.WorkoutNotFoundException;
import com.fittrack.model.Exercise;
import com.fittrack.model.Workout;
import com.fittrack.model.WorkoutSet;
import com.fittrack.repository.ExerciseRepository;
import com.fittrack.repository.WorkoutRepository;
import com.fittrack.repository.WorkoutSetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkoutServiceTest {

    @Mock
    private WorkoutRepository workoutRepository;

    @Mock
    private WorkoutSetRepository workoutSetRepository;

    @Mock
    private ExerciseRepository exerciseRepository;

    @InjectMocks
    private WorkoutService workoutService;

    private Workout workout;
    private Exercise exercise;
    private WorkoutSet workoutSet;
    private WorkoutStartRequest startRequest;
    private WorkoutSetRequest setRequest;

    @BeforeEach
    void setUp() {
        workout = new Workout();
        workout.setId(1L);
        workout.setUserId(1L);
        workout.setWorkoutDate(LocalDate.now());
        workout.setStartTime(LocalDateTime.now());
        workout.setTotalVolume(BigDecimal.ZERO);
        workout.setSets(new ArrayList<>());

        exercise = new Exercise();
        exercise.setId(1L);
        exercise.setName("Bench Press");
        exercise.setMuscleGroup("CHEST");

        workoutSet = new WorkoutSet();
        workoutSet.setId(1L);
        workoutSet.setWorkout(workout);
        workoutSet.setExercise(exercise);
        workoutSet.setSetNumber(1);
        workoutSet.setReps(10);
        workoutSet.setWeightKg(new BigDecimal("60.0"));
        workoutSet.setRpe(7);

        startRequest = new WorkoutStartRequest();
        startRequest.setDate(LocalDate.now());
        startRequest.setNotes("Test workout");

        setRequest = new WorkoutSetRequest();
        setRequest.setExerciseId(1L);
        setRequest.setSetNumber(1);
        setRequest.setReps(10);
        setRequest.setWeightKg(new BigDecimal("60.0"));
        setRequest.setRpe(7);
    }

    @Test
    void testStartWorkout_Success() {
        // Arrange
        when(workoutRepository.findActiveWorkout(1L)).thenReturn(Optional.empty());
        when(workoutRepository.save(any(Workout.class))).thenReturn(workout);

        // Act
        WorkoutResponse response = workoutService.startWorkout(1L, startRequest);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(1L, response.getUserId());
        assertEquals(LocalDate.now(), response.getWorkoutDate());
        assertEquals(BigDecimal.ZERO, response.getTotalVolume());
        assertEquals(0, response.getTotalSets());

        verify(workoutRepository).save(any(Workout.class));
    }

    @Test
    void testStartWorkout_ThrowsWhenActiveWorkoutExists() {
        // Arrange
        when(workoutRepository.findActiveWorkout(1L)).thenReturn(Optional.of(workout));

        // Act & Assert
        ActiveWorkoutExistsException ex = assertThrows(
                ActiveWorkoutExistsException.class,
                () -> workoutService.startWorkout(1L, startRequest));
        assertTrue(ex.getMessage().contains("id=1"),
                "Message should reference the existing active workout id");

        verify(workoutRepository).findActiveWorkout(1L);
        verify(workoutRepository, never()).save(any(Workout.class));
    }

    @Test
    void testLogSet_Success() {
        // Arrange
        when(workoutRepository.findByIdAndUserId(anyLong(), anyLong())).thenReturn(Optional.of(workout));
        when(exerciseRepository.findById(anyLong())).thenReturn(Optional.of(exercise));
        when(workoutSetRepository.save(any(WorkoutSet.class))).thenReturn(workoutSet);

        // Act
        WorkoutSetResponse response = workoutService.logSet(1L, setRequest, 1L);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(1L, response.getWorkoutId());
        assertEquals(1L, response.getExerciseId());
        assertEquals("Bench Press", response.getExerciseName());
        assertEquals(10, response.getReps());
        assertEquals(new BigDecimal("60.0"), response.getWeightKg());
        assertEquals(7, response.getRpe());
        assertEquals(600.0, response.getVolumeLoad());

        verify(workoutRepository).findByIdAndUserId(1L, 1L);
        verify(exerciseRepository).findById(1L);
        verify(workoutSetRepository).save(any(WorkoutSet.class));
    }

    @Test
    void testLogSet_WorkoutNotFound() {
        // Arrange
        when(workoutRepository.findByIdAndUserId(anyLong(), anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(WorkoutNotFoundException.class, () -> {
            workoutService.logSet(1L, setRequest, 1L);
        });

        verify(workoutRepository).findByIdAndUserId(1L, 1L);
        verify(exerciseRepository, never()).findById(anyLong());
        verify(workoutSetRepository, never()).save(any(WorkoutSet.class));
    }

    @Test
    void testLogSet_ExerciseNotFound() {
        // Arrange
        when(workoutRepository.findByIdAndUserId(anyLong(), anyLong())).thenReturn(Optional.of(workout));
        when(exerciseRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ExerciseNotFoundException.class, () -> {
            workoutService.logSet(1L, setRequest, 1L);
        });

        verify(workoutRepository).findByIdAndUserId(1L, 1L);
        verify(exerciseRepository).findById(1L);
        verify(workoutSetRepository, never()).save(any(WorkoutSet.class));
    }

    @Test
    void testFinishWorkout_Success() {
        // Arrange
        workout.getSets().add(workoutSet);
        when(workoutRepository.findByIdAndUserId(anyLong(), anyLong())).thenReturn(Optional.of(workout));
        when(workoutSetRepository.findByWorkoutIdOrderBySetNumberAsc(1L)).thenReturn(List.of(workoutSet));
        when(workoutRepository.save(any(Workout.class))).thenReturn(workout);

        // Act
        WorkoutResponse response = workoutService.finishWorkout(1L, 1L);

        // Assert
        assertNotNull(response);
        assertNotNull(workout.getEndTime());
        assertEquals(new BigDecimal("600.0"), workout.getTotalVolume());
        assertEquals(1, response.getTotalSets());

        verify(workoutRepository).findByIdAndUserId(1L, 1L);
        verify(workoutRepository).save(workout);
    }

    @Test
    void testFinishWorkout_NotFound() {
        // Arrange
        when(workoutRepository.findByIdAndUserId(anyLong(), anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(WorkoutNotFoundException.class, () -> {
            workoutService.finishWorkout(1L, 1L);
        });

        verify(workoutRepository).findByIdAndUserId(1L, 1L);
        verify(workoutRepository, never()).save(any(Workout.class));
    }

    @Test
    void testGetWorkoutHistory_Success() {
        // Arrange — sets are now eagerly loaded via @EntityGraph, so the service reads
        // them from workout.getSets() directly rather than making a separate query.
        List<Workout> workouts = List.of(workout);
        when(workoutRepository.findByUserIdAndWorkoutDateBetween(anyLong(), any(LocalDate.class), any(LocalDate.class)))
            .thenReturn(workouts);

        // Act
        List<WorkoutHistoryResponse> responses = workoutService.getWorkoutHistory(1L, LocalDate.now().minusDays(7), LocalDate.now());

        // Assert
        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals(1L, responses.get(0).getId());

        verify(workoutRepository).findByUserIdAndWorkoutDateBetween(anyLong(), any(LocalDate.class), any(LocalDate.class));
        verify(workoutSetRepository, never()).findByWorkoutIdOrderBySetNumberAsc(anyLong());
    }

    @Test
    void testGetWorkoutDetail_Success() {
        // Arrange
        workout.getSets().add(workoutSet);
        when(workoutRepository.findByIdAndUserId(anyLong(), anyLong())).thenReturn(Optional.of(workout));
        when(workoutSetRepository.findByWorkoutIdOrderBySetNumberAsc(anyLong())).thenReturn(List.of(workoutSet));

        // Act
        WorkoutDetailResponse response = workoutService.getWorkoutDetail(1L, 1L);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getId());

        verify(workoutRepository).findByIdAndUserId(1L, 1L);
    }

    @Test
    void testGetWorkoutDetail_NotFound() {
        // Arrange
        when(workoutRepository.findByIdAndUserId(anyLong(), anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(WorkoutNotFoundException.class, () -> {
            workoutService.getWorkoutDetail(1L, 1L);
        });

        verify(workoutRepository).findByIdAndUserId(1L, 1L);
    }

    @Test
    void testGetActiveWorkout_ReturnsDetail_WhenActiveExists() {
        // Arrange
        when(workoutRepository.findActiveWorkout(1L)).thenReturn(Optional.of(workout));
        when(workoutSetRepository.findByWorkoutIdOrderBySetNumberAsc(1L)).thenReturn(List.of(workoutSet));

        // Act
        WorkoutDetailResponse response = workoutService.getActiveWorkout(1L);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(1L, response.getUserId());
        assertNotNull(response.getSets());
        assertEquals(1, response.getSets().size());
        assertEquals(1L, response.getSets().get(0).getId());

        verify(workoutRepository).findActiveWorkout(1L);
        verify(workoutSetRepository).findByWorkoutIdOrderBySetNumberAsc(1L);
    }

    @Test
    void testGetActiveWorkout_ReturnsNull_WhenNoActive() {
        // Arrange
        when(workoutRepository.findActiveWorkout(1L)).thenReturn(Optional.empty());

        // Act
        WorkoutDetailResponse response = workoutService.getActiveWorkout(1L);

        // Assert
        assertNull(response);

        verify(workoutRepository).findActiveWorkout(1L);
        verify(workoutSetRepository, never()).findByWorkoutIdOrderBySetNumberAsc(anyLong());
    }
}
