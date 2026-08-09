package com.fittrack.service;

import com.fittrack.model.Workout;
import com.fittrack.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MetricsServiceTest {

    @Mock private DailyStatsRepository statsRepository;
    @Mock private UserProfileRepository profileRepository;
    @Mock private WorkoutRepository workoutRepository;
    @Mock private NutritionLogRepository nutritionLogRepository;
    @Mock private BodyMetricsRepository bodyMetricsRepository;
    @Mock private WorkoutSetRepository workoutSetRepository;
    @Mock private UserRepository userRepository;
    @Mock private NutritionCalculator nutritionCalculator;

    @InjectMocks
    private MetricsService service;

    @BeforeEach
    void setUp() {
        // no-op
    }

    private static Workout workoutOn(LocalDate date) {
        Workout w = new Workout();
        w.setUserId(1L);
        w.setWorkoutDate(date);
        return w;
    }

    @Test
    void consistencyStreak_noWorkouts_returnsZero() {
        when(workoutRepository.findTop30ByUserIdOrderByWorkoutDateDesc(1L)).thenReturn(List.of());
        assertEquals(0, service.calculateConsistencyStreak(1L));
    }

    @Test
    void consistencyStreak_lastWorkoutOlderThanYesterday_returnsZero() {
        LocalDate threeDaysAgo = LocalDate.now().minusDays(3);
        when(workoutRepository.findTop30ByUserIdOrderByWorkoutDateDesc(1L))
                .thenReturn(List.of(workoutOn(threeDaysAgo)));
        assertEquals(0, service.calculateConsistencyStreak(1L));
    }

    @Test
    void consistencyStreak_todayAndYesterday_returnsTwo() {
        LocalDate today = LocalDate.now();
        when(workoutRepository.findTop30ByUserIdOrderByWorkoutDateDesc(1L))
                .thenReturn(List.of(workoutOn(today), workoutOn(today.minusDays(1))));
        assertEquals(2, service.calculateConsistencyStreak(1L));
    }

    @Test
    void consistencyStreak_gapBreaksStreak() {
        // Mon, Wed, Fri — was previously counted as 3 due to the OR-yesterday bug.
        LocalDate today = LocalDate.now();
        List<Workout> workouts = new ArrayList<>(List.of(
                workoutOn(today),
                workoutOn(today.minusDays(2)),
                workoutOn(today.minusDays(4))
        ));
        when(workoutRepository.findTop30ByUserIdOrderByWorkoutDateDesc(1L)).thenReturn(workouts);
        assertEquals(1, service.calculateConsistencyStreak(1L));
    }

    @Test
    void consistencyStreak_duplicateSameDay_countedOnce() {
        LocalDate today = LocalDate.now();
        List<Workout> workouts = new ArrayList<>(List.of(
                workoutOn(today),
                workoutOn(today),
                workoutOn(today.minusDays(1))
        ));
        when(workoutRepository.findTop30ByUserIdOrderByWorkoutDateDesc(1L)).thenReturn(workouts);
        assertEquals(2, service.calculateConsistencyStreak(1L));
    }

    @Test
    void bestStreak_gap_returnsLongestRun() {
        // Longest consecutive run should be 3 (Jan 1-3), broken by a gap, then 2 (Jan 10-11).
        List<Workout> workouts = List.of(
                workoutOn(LocalDate.of(2026, 1, 1)),
                workoutOn(LocalDate.of(2026, 1, 2)),
                workoutOn(LocalDate.of(2026, 1, 3)),
                workoutOn(LocalDate.of(2026, 1, 10)),
                workoutOn(LocalDate.of(2026, 1, 11))
        );
        when(workoutRepository.findByUserIdOrderByWorkoutDateAsc(1L)).thenReturn(workouts);
        assertEquals(3, service.calculateBestStreak(1L));
    }
}
