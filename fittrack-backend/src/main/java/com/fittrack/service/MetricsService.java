package com.fittrack.service;

import com.fittrack.dto.request.BodyMetricsRequest;
import com.fittrack.dto.request.WeightLogRequest;
import com.fittrack.dto.response.*;
import com.fittrack.exception.ResourceNotFoundException;
import com.fittrack.model.*;
import com.fittrack.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Metrics Service
 * Handles water tracking, weight logging, and daily stats
 * Reference: US-12, US-13, FR-META-01, FR-META-02, FR-META-04
 */
@Service
@Slf4j
public class MetricsService {

    @Autowired
    private DailyStatsRepository statsRepository;

    @Autowired
    private UserProfileRepository profileRepository;

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private NutritionLogRepository nutritionLogRepository;

    @Autowired
    private BodyMetricsRepository bodyMetricsRepository;

    @Autowired
    private WorkoutSetRepository workoutSetRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * US-12: Add water intake
     * AC: Quick-add buttons (250ml, 500ml, 1L)
     * AC: Optimistic UI update
     */
    @Transactional
    public DailyStats addWater(Long userId, Integer milliliters) {
        log.info("Adding {} ml of water for user ID: {}", milliliters, userId);

        LocalDate today = LocalDate.now();

        // AC: Get or create today's stats
        DailyStats stats = statsRepository.findByUserIdAndStatDate(userId, today)
                .orElse(new DailyStats(userId, today));

        // AC: Increment water counter
        int currentWater = stats.getWaterMl() != null ? stats.getWaterMl() : 0;
        stats.setWaterMl(currentWater + milliliters);

        return statsRepository.save(stats);
    }

    /**
     * US-13: Log weight
     * AC: Accept weight with one decimal place
     */
    @Transactional
    public DailyStats logWeight(Long userId, WeightLogRequest request) {
        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();
        log.info("Logging weight {} kg for user ID: {} on date: {}", request.getWeightKg(), userId, date);

        // Get or create stats for the date
        DailyStats stats = statsRepository.findByUserIdAndStatDate(userId, date)
                .orElse(new DailyStats(userId, date));

        stats.setWeightKg(request.getWeightKg());
        if (request.getNotes() != null) {
            stats.setNotes(request.getNotes());
        }

        return statsRepository.save(stats);
    }

    /**
     * US-13: Get weight trend with moving average
     * AC: Visualize weight over time with trend line
     */
    @Transactional(readOnly = true)
    public WeightTrendResponse getWeightTrend(Long userId, LocalDate startDate, LocalDate endDate) {
        log.info("Getting weight trend for user ID: {} from {} to {}", userId, startDate, endDate);

        // Get all weight logs in range
        List<DailyStats> stats = statsRepository.findWeightLogsBetween(userId, startDate, endDate);

        if (stats.isEmpty()) {
            throw new ResourceNotFoundException("No weight data found for the specified period");
        }

        // Convert to data points
        List<WeightTrendResponse.WeightDataPoint> dataPoints = stats.stream()
                .map(s -> new WeightTrendResponse.WeightDataPoint(s.getStatDate(), s.getWeightKg()))
                .collect(Collectors.toList());

        // Calculate weight change
        BigDecimal startWeight = dataPoints.get(0).getWeight();
        BigDecimal currentWeight = dataPoints.get(dataPoints.size() - 1).getWeight();
        BigDecimal change = currentWeight.subtract(startWeight);

        // Calculate percentage change
        double changePercentage = startWeight.doubleValue() != 0
                ? (change.doubleValue() / startWeight.doubleValue()) * 100
                : 0.0;

        WeightTrendResponse response = new WeightTrendResponse();
        response.setDataPoints(dataPoints);
        response.setStartWeight(startWeight);
        response.setCurrentWeight(currentWeight);
        response.setChange(change);
        response.setChangePercentage(Math.round(changePercentage * 100.0) / 100.0);

        return response;
    }

    /**
     * Get today's stats
     */
    @Transactional(readOnly = true)
    public DailyStats getTodayStats(Long userId) {
        LocalDate today = LocalDate.now();
        return statsRepository.findByUserIdAndStatDate(userId, today)
                .orElse(new DailyStats(userId, today));
    }

    /**
     * Get stats for a specific date
     */
    @Transactional(readOnly = true)
    public DailyStats getStatsForDate(Long userId, LocalDate date) {
        return statsRepository.findByUserIdAndStatDate(userId, date)
                .orElse(new DailyStats(userId, date));
    }

    /**
     * Get dashboard summary
     * Shows overview of all metrics
     */
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary(Long userId) {
        log.info("Getting dashboard summary for user ID: {}", userId);

        LocalDate today = LocalDate.now();

        // Today's stats
        DailyStats todayStats = getTodayStats(userId);

        // Workout stats
        Long workoutsThisWeek = workoutRepository.countByUserIdAndWorkoutDateAfter(
                userId, today.minusDays(7)
        );
        Long totalWorkouts = workoutRepository.countByUserId(userId);

        // Nutrition today
        Double caloriesConsumed = nutritionLogRepository.getTotalCaloriesForDate(userId, today);
        Double proteinConsumed = nutritionLogRepository.getTotalProteinForDate(userId, today);

        // Get calorie target from profile
        UserProfile profile = profileRepository.findByUserId(userId).orElse(null);
        Double caloriesTarget = 2000.0; // Default
        Double proteinTarget = 150.0;   // Default

        if (profile != null && todayStats.getWeightKg() != null) {
            // Simplified calculation (should use ProfileService in production)
            caloriesTarget = 2000.0; // Placeholder
            proteinTarget = (caloriesTarget * 0.30) / 4; // 30% protein
        }

        // Weight stats
        BigDecimal currentWeight = todayStats.getWeightKg();
        BigDecimal targetWeight = profile != null ? profile.getTargetWeightKg() : null;
        BigDecimal weightChange = null;

        if (currentWeight != null && targetWeight != null) {
            weightChange = currentWeight.subtract(targetWeight);
        }

        DashboardSummaryResponse response = new DashboardSummaryResponse();
        response.setWaterMl(todayStats.getWaterMl() != null ? todayStats.getWaterMl() : 0);
        response.setWaterTarget(2500); // Default 2.5L target
        response.setWorkoutsThisWeek(workoutsThisWeek);
        response.setTotalWorkouts(totalWorkouts);
        response.setCaloriesConsumed(caloriesConsumed != null ? caloriesConsumed : 0.0);
        response.setCaloriesTarget(caloriesTarget);
        response.setProteinConsumed(proteinConsumed != null ? proteinConsumed : 0.0);
        response.setProteinTarget(proteinTarget);
        response.setCurrentWeight(currentWeight);
        response.setTargetWeight(targetWeight);
        response.setWeightChange(weightChange);

        return response;
    }

    /**
     * Update daily notes
     */
    @Transactional
    public DailyStats updateNotes(Long userId, LocalDate date, String notes) {
        DailyStats stats = statsRepository.findByUserIdAndStatDate(userId, date)
                .orElse(new DailyStats(userId, date));

        stats.setNotes(notes);
        return statsRepository.save(stats);
    }

    /**
     * Get analytics summary
     * Comprehensive overview of fitness progress
     */
    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getAnalyticsSummary(Long userId) {
        log.info("Getting analytics summary for user ID: {}", userId);

        // Get total workouts
        Long totalWorkouts = workoutRepository.countByUserId(userId);

        // Calculate total volume (sum of all sets weight * reps)
        Double totalVolume = workoutSetRepository.getTotalVolumeByUserId(userId);
        if (totalVolume == null) totalVolume = 0.0;

        // Calculate average workout duration
        Double avgDuration = workoutRepository.getAverageWorkoutDuration(userId);
        Integer avgWorkoutDuration = avgDuration != null ? avgDuration.intValue() : 0;

        // Get consistency streak
        Integer consistencyStreak = calculateConsistencyStreak(userId);
        Integer bestStreak = calculateBestStreak(userId);

        // Calculate nutrition compliance
        UserProfile profile = profileRepository.findByUserId(userId).orElse(null);
        Double calorieCompliance = calculateCalorieCompliance(userId, profile);
        Double proteinCompliance = calculateProteinCompliance(userId, profile);

        // Get personal records
        List<PersonalRecordResponse> personalRecords = getPersonalRecordsList(userId);

        // Get recent weekly progress (last 4 weeks)
        List<WeeklyProgressResponse> recentProgress = getWeeklyProgressList(userId, 4);

        // Get body metrics (last 10 entries)
        List<BodyMetricsResponse> bodyMetrics = getBodyMetricsList(userId);

        return AnalyticsSummaryResponse.builder()
                .totalWorkouts(totalWorkouts.intValue())
                .totalVolume(totalVolume)
                .avgWorkoutDuration(avgWorkoutDuration)
                .consistencyStreak(consistencyStreak)
                .bestStreak(bestStreak)
                .calorieCompliance(calorieCompliance)
                .proteinCompliance(proteinCompliance)
                .personalRecords(personalRecords)
                .recentProgress(recentProgress)
                .bodyMetrics(bodyMetrics)
                .build();
    }

    /**
     * Get weekly progress
     */
    @Transactional(readOnly = true)
    public List<WeeklyProgressResponse> getWeeklyProgress(Long userId, Integer weeksBack) {
        return getWeeklyProgressList(userId, weeksBack);
    }

    private List<WeeklyProgressResponse> getWeeklyProgressList(Long userId, Integer weeksBack) {
        List<WeeklyProgressResponse> progressList = new ArrayList<>();
        LocalDate endDate = LocalDate.now();

        for (int i = 0; i < weeksBack; i++) {
            LocalDate weekStart = endDate.minusWeeks(i).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate weekEnd = weekStart.plusDays(6);

            // Get workouts for the week
            List<Workout> workouts = workoutRepository.findByUserIdAndWorkoutDateBetween(userId, weekStart, weekEnd);

            // Calculate metrics
            Integer workoutCount = workouts.size();
            Double totalVolume = workouts.stream()
                    .flatMap(w -> w.getSets().stream())
                    .mapToDouble(ws -> ws.getWeightKg().doubleValue() * ws.getReps())
                    .sum();

            // Calculate average duration (difference between start and end time)
            Integer avgDuration = workouts.isEmpty() ? 0 :
                    (int) workouts.stream()
                            .filter(w -> w.getStartTime() != null && w.getEndTime() != null)
                            .mapToLong(w -> java.time.Duration.between(w.getStartTime(), w.getEndTime()).toMinutes())
                            .average()
                            .orElse(0);

            // Get nutrition for the week
            Double totalCalories = nutritionLogRepository.getTotalCaloriesBetweenDates(userId, weekStart, weekEnd);
            Integer avgCalories = totalCalories != null && workoutCount > 0 ? totalCalories.intValue() / 7 : 0;

            // Calculate compliance rate (placeholder logic)
            Double complianceRate = workoutCount >= 3 ? 80.0 : (workoutCount * 100.0 / 3.0);

            WeeklyProgressResponse progress = WeeklyProgressResponse.builder()
                    .weekStartDate(weekStart)
                    .workoutCount(workoutCount)
                    .totalVolume(totalVolume)
                    .avgWorkoutDuration(avgDuration)
                    .caloriesConsumed(totalCalories != null ? totalCalories.intValue() : 0)
                    .avgDailyCalories(avgCalories)
                    .complianceRate(Math.round(complianceRate * 10) / 10.0)
                    .build();

            progressList.add(progress);
        }

        return progressList;
    }

    /**
     * Get personal records
     */
    @Transactional(readOnly = true)
    public List<PersonalRecordResponse> getPersonalRecords(Long userId) {
        return getPersonalRecordsList(userId);
    }

    private List<PersonalRecordResponse> getPersonalRecordsList(Long userId) {
        List<PersonalRecordResponse> records = new ArrayList<>();

        // Get all workouts and find best performances per exercise
        List<Workout> workouts = workoutRepository.findByUserId(userId);

        // Group by exercise and find best weight
        workouts.stream()
                .flatMap(w -> w.getSets().stream())
                .collect(Collectors.groupingBy(ws -> ws.getExercise().getName()))
                .forEach((exerciseName, sets) -> {
                    WorkoutSet bestSet = sets.stream()
                            .max((a, b) -> a.getWeightKg().compareTo(b.getWeightKg()))
                            .orElse(null);

                    if (bestSet != null) {
                        Double bestVolume = sets.stream()
                                .mapToDouble(ws -> ws.getWeightKg().doubleValue() * ws.getReps())
                                .max()
                                .orElse(0.0);

                        records.add(PersonalRecordResponse.builder()
                                .exerciseName(exerciseName)
                                .bestWeight(bestSet.getWeightKg().doubleValue())
                                .bestVolume(bestVolume)
                                .bestReps(bestSet.getReps())
                                .achievedDate(bestSet.getWorkout().getWorkoutDate())
                                .build());
                    }
                });

        return records;
    }

    /**
     * Body Metrics Operations
     */
    @Transactional(readOnly = true)
    public List<BodyMetricsResponse> getBodyMetrics(Long userId, LocalDate startDate, LocalDate endDate) {
        List<BodyMetrics> metrics;

        if (startDate != null && endDate != null) {
            metrics = bodyMetricsRepository.findByUserIdAndDateBetweenOrderByDateDesc(userId, startDate, endDate);
        } else {
            metrics = bodyMetricsRepository.findByUserIdOrderByDateDesc(userId);
        }

        return metrics.stream()
                .map(this::convertToBodyMetricsResponse)
                .collect(Collectors.toList());
    }

    private List<BodyMetricsResponse> getBodyMetricsList(Long userId) {
        List<BodyMetrics> metrics = bodyMetricsRepository.findByUserIdOrderByDateDesc(userId);
        return metrics.stream()
                .limit(10)
                .map(this::convertToBodyMetricsResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BodyMetricsResponse addBodyMetrics(Long userId, BodyMetricsRequest request) {
        log.info("Adding body metrics for user ID: {} on date: {}", userId, request.getDate());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BodyMetrics metrics = BodyMetrics.builder()
                .user(user)
                .date(request.getDate())
                .weightKg(request.getWeightKg())
                .bodyFatPercentage(request.getBodyFatPercentage())
                .muscleMassKg(request.getMuscleMassKg())
                .waistCm(request.getWaistCm())
                .chestCm(request.getChestCm())
                .armsCm(request.getArmsCm())
                .legsCm(request.getLegsCm())
                .notes(request.getNotes())
                .build();

        BodyMetrics saved = bodyMetricsRepository.save(metrics);
        return convertToBodyMetricsResponse(saved);
    }

    @Transactional
    public BodyMetricsResponse updateBodyMetrics(Long userId, Long id, BodyMetricsRequest request) {
        BodyMetrics metrics = bodyMetricsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Body metrics not found"));

        if (!metrics.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Body metrics not found for this user");
        }

        metrics.setDate(request.getDate());
        metrics.setWeightKg(request.getWeightKg());
        metrics.setBodyFatPercentage(request.getBodyFatPercentage());
        metrics.setMuscleMassKg(request.getMuscleMassKg());
        metrics.setWaistCm(request.getWaistCm());
        metrics.setChestCm(request.getChestCm());
        metrics.setArmsCm(request.getArmsCm());
        metrics.setLegsCm(request.getLegsCm());
        metrics.setNotes(request.getNotes());

        BodyMetrics updated = bodyMetricsRepository.save(metrics);
        return convertToBodyMetricsResponse(updated);
    }

    @Transactional
    public void deleteBodyMetrics(Long userId, Long id) {
        BodyMetrics metrics = bodyMetricsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Body metrics not found"));

        if (!metrics.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Body metrics not found for this user");
        }

        bodyMetricsRepository.delete(metrics);
    }

    private BodyMetricsResponse convertToBodyMetricsResponse(BodyMetrics metrics) {
        return BodyMetricsResponse.builder()
                .id(metrics.getId())
                .userId(metrics.getUser().getId())
                .date(metrics.getDate())
                .weightKg(metrics.getWeightKg())
                .bodyFatPercentage(metrics.getBodyFatPercentage())
                .muscleMassKg(metrics.getMuscleMassKg())
                .waistCm(metrics.getWaistCm())
                .chestCm(metrics.getChestCm())
                .armsCm(metrics.getArmsCm())
                .legsCm(metrics.getLegsCm())
                .notes(metrics.getNotes())
                .build();
    }

    /**
     * Helper methods for calculations
     */
    private Integer calculateConsistencyStreak(Long userId) {
        List<Workout> workouts = workoutRepository.findTop30ByUserIdOrderByWorkoutDateDesc(userId);

        if (workouts.isEmpty()) return 0;

        int streak = 0;
        LocalDate currentDate = LocalDate.now();

        for (Workout workout : workouts) {
            if (workout.getWorkoutDate().isEqual(currentDate) ||
                workout.getWorkoutDate().isEqual(currentDate.minusDays(1))) {
                streak++;
                currentDate = workout.getWorkoutDate().minusDays(1);
            } else {
                break;
            }
        }

        return streak;
    }

    private Integer calculateBestStreak(Long userId) {
        List<Workout> workouts = workoutRepository.findByUserIdOrderByWorkoutDateAsc(userId);

        if (workouts.isEmpty()) return 0;

        int maxStreak = 0;
        int currentStreak = 1;
        LocalDate previousDate = workouts.get(0).getWorkoutDate();

        for (int i = 1; i < workouts.size(); i++) {
            LocalDate currentDate = workouts.get(i).getWorkoutDate();

            if (currentDate.isEqual(previousDate.plusDays(1))) {
                currentStreak++;
            } else {
                maxStreak = Math.max(maxStreak, currentStreak);
                currentStreak = 1;
            }

            previousDate = currentDate;
        }

        return Math.max(maxStreak, currentStreak);
    }

    private Double calculateCalorieCompliance(Long userId, UserProfile profile) {
        if (profile == null) return 0.0;

        LocalDate startDate = LocalDate.now().minusDays(30);
        LocalDate endDate = LocalDate.now();

        Double targetCalories = 2000.0; // Simplified
        Double actualCalories = nutritionLogRepository.getAverageCaloriesBetweenDates(userId, startDate, endDate);

        if (actualCalories == null || targetCalories == 0) return 0.0;

        return Math.min((actualCalories / targetCalories) * 100, 100.0);
    }

    private Double calculateProteinCompliance(Long userId, UserProfile profile) {
        if (profile == null) return 0.0;

        LocalDate startDate = LocalDate.now().minusDays(30);
        LocalDate endDate = LocalDate.now();

        Double targetProtein = 150.0; // Simplified
        Double actualProtein = nutritionLogRepository.getAverageProteinBetweenDates(userId, startDate, endDate);

        if (actualProtein == null || targetProtein == 0) return 0.0;

        return Math.min((actualProtein / targetProtein) * 100, 100.0);
    }
}
