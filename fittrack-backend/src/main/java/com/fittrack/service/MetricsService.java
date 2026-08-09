package com.fittrack.service;

import com.fittrack.dto.request.BodyMetricsRequest;
import com.fittrack.dto.request.WeightLogRequest;
import com.fittrack.dto.response.*;
import com.fittrack.exception.ResourceNotFoundException;
import com.fittrack.model.*;
import com.fittrack.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.TreeSet;
import java.util.stream.Collectors;

/**
 * Metrics Service
 * Handles water tracking, weight logging, and daily stats
 * Reference: US-12, US-13, FR-META-01, FR-META-02, FR-META-04
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class MetricsService {

    private final DailyStatsRepository statsRepository;
    private final UserProfileRepository profileRepository;
    private final WorkoutRepository workoutRepository;
    private final NutritionLogRepository nutritionLogRepository;
    private final BodyMetricsRepository bodyMetricsRepository;
    private final WorkoutSetRepository workoutSetRepository;
    private final NutritionCalculator nutritionCalculator;

    @Transactional
    public DailyStats addWater(Long userId, Integer milliliters) {
        log.info("Adding {} ml of water for user ID: {}", milliliters, userId);

        LocalDate today = LocalDate.now();

        DailyStats stats = statsRepository.findByUserIdAndStatDate(userId, today)
                .orElse(new DailyStats(userId, today));

        int currentWater = stats.getWaterMl() != null ? stats.getWaterMl() : 0;
        stats.setWaterMl(currentWater + milliliters);

        return statsRepository.save(stats);
    }

    @Transactional
    public DailyStats logWeight(Long userId, WeightLogRequest request) {
        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();
        log.info("Logging weight {} kg for user ID: {} on date: {}", request.getWeightKg(), userId, date);

        DailyStats stats = statsRepository.findByUserIdAndStatDate(userId, date)
                .orElse(new DailyStats(userId, date));

        stats.setWeightKg(request.getWeightKg());
        if (request.getNotes() != null) {
            stats.setNotes(request.getNotes());
        }

        return statsRepository.save(stats);
    }

    @Transactional(readOnly = true)
    public WeightTrendResponse getWeightTrend(Long userId, LocalDate startDate, LocalDate endDate) {
        log.info("Getting weight trend for user ID: {} from {} to {}", userId, startDate, endDate);

        List<DailyStats> stats = statsRepository.findWeightLogsBetween(userId, startDate, endDate);

        if (stats.isEmpty()) {
            throw new ResourceNotFoundException("No weight data found for the specified period");
        }

        List<WeightTrendResponse.WeightDataPoint> dataPoints = stats.stream()
                .map(s -> new WeightTrendResponse.WeightDataPoint(s.getStatDate(), s.getWeightKg()))
                .collect(Collectors.toList());

        BigDecimal startWeight = dataPoints.get(0).getWeight();
        BigDecimal currentWeight = dataPoints.get(dataPoints.size() - 1).getWeight();
        BigDecimal change = currentWeight.subtract(startWeight);

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

    @Transactional(readOnly = true)
    public DailyStats getTodayStats(Long userId) {
        LocalDate today = LocalDate.now();
        return statsRepository.findByUserIdAndStatDate(userId, today)
                .orElse(new DailyStats(userId, today));
    }

    @Transactional(readOnly = true)
    public DailyStats getStatsForDate(Long userId, LocalDate date) {
        return statsRepository.findByUserIdAndStatDate(userId, date)
                .orElse(new DailyStats(userId, date));
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary(Long userId) {
        log.info("Getting dashboard summary for user ID: {}", userId);

        LocalDate today = LocalDate.now();

        DailyStats todayStats = getTodayStats(userId);

        Long workoutsThisWeek = workoutRepository.countByUserIdAndWorkoutDateAfter(
                userId, today.minusDays(7)
        );
        Long totalWorkouts = workoutRepository.countByUserId(userId);

        Double caloriesConsumed = nutritionLogRepository.getTotalCaloriesForDate(userId, today);
        Double proteinConsumed = nutritionLogRepository.getTotalProteinForDate(userId, today);

        UserProfile profile = profileRepository.findByUserId(userId).orElse(null);
        BigDecimal currentWeightForTargets = todayStats.getWeightKg() != null
                ? todayStats.getWeightKg()
                : statsRepository.findRecentWeightLogs(userId).stream()
                        .findFirst()
                        .map(DailyStats::getWeightKg)
                        .orElse(null);

        double caloriesTarget = nutritionCalculator.targetCalories(profile, currentWeightForTargets);
        double proteinTarget = nutritionCalculator.targetProteinGrams(caloriesTarget);

        BigDecimal currentWeight = todayStats.getWeightKg();
        BigDecimal targetWeight = profile != null ? profile.getTargetWeightKg() : null;
        BigDecimal weightChange = null;

        if (currentWeight != null && targetWeight != null) {
            weightChange = currentWeight.subtract(targetWeight);
        }

        DashboardSummaryResponse response = new DashboardSummaryResponse();
        response.setWaterMl(todayStats.getWaterMl() != null ? todayStats.getWaterMl() : 0);
        response.setWaterTarget(2500);
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

    @Transactional
    public DailyStats updateNotes(Long userId, LocalDate date, String notes) {
        DailyStats stats = statsRepository.findByUserIdAndStatDate(userId, date)
                .orElse(new DailyStats(userId, date));

        stats.setNotes(notes);
        return statsRepository.save(stats);
    }

    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getAnalyticsSummary(Long userId) {
        log.info("Getting analytics summary for user ID: {}", userId);

        Long totalWorkouts = workoutRepository.countByUserId(userId);

        Double totalVolume = workoutSetRepository.getTotalVolumeByUserId(userId);
        if (totalVolume == null) totalVolume = 0.0;

        Double avgDuration = workoutRepository.getAverageWorkoutDuration(userId);
        Integer avgWorkoutDuration = avgDuration != null ? avgDuration.intValue() : 0;

        Integer consistencyStreak = calculateConsistencyStreak(userId);
        Integer bestStreak = calculateBestStreak(userId);

        UserProfile profile = profileRepository.findByUserId(userId).orElse(null);
        BigDecimal currentWeight = statsRepository.findRecentWeightLogs(userId).stream()
                .findFirst()
                .map(DailyStats::getWeightKg)
                .orElse(null);
        Double calorieCompliance = calculateCalorieCompliance(userId, profile, currentWeight);
        Double proteinCompliance = calculateProteinCompliance(userId, profile, currentWeight);

        List<PersonalRecordResponse> personalRecords = getPersonalRecordsList(userId);

        List<WeeklyProgressResponse> recentProgress = getWeeklyProgressList(userId, 4);

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

    @Transactional(readOnly = true)
    public List<WeeklyProgressResponse> getWeeklyProgress(Long userId, Integer weeksBack) {
        return getWeeklyProgressList(userId, weeksBack);
    }

    private List<WeeklyProgressResponse> getWeeklyProgressList(Long userId, Integer weeksBack) {
        List<WeeklyProgressResponse> progressList = new ArrayList<>();
        LocalDate endDate = LocalDate.now();

        UserProfile profile = profileRepository.findByUserId(userId).orElse(null);
        BigDecimal currentWeight = statsRepository.findRecentWeightLogs(userId).stream()
                .findFirst()
                .map(DailyStats::getWeightKg)
                .orElse(null);
        double targetCalories = nutritionCalculator.targetCalories(profile, currentWeight);

        for (int i = 0; i < weeksBack; i++) {
            LocalDate weekStart = endDate.minusWeeks(i).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate weekEnd = weekStart.plusDays(6);

            List<Workout> workouts = workoutRepository.findByUserIdAndWorkoutDateBetween(userId, weekStart, weekEnd);

            Integer workoutCount = workouts.size();
            Double totalVolume = workouts.stream()
                    .flatMap(w -> w.getSets().stream())
                    .mapToDouble(ws -> ws.getWeightKg().doubleValue() * ws.getReps())
                    .sum();

            Integer avgDuration = workouts.isEmpty() ? 0 :
                    (int) workouts.stream()
                            .filter(w -> w.getStartTime() != null && w.getEndTime() != null)
                            .mapToLong(w -> java.time.Duration.between(w.getStartTime(), w.getEndTime()).toMinutes())
                            .average()
                            .orElse(0);

            Double totalCalories = nutritionLogRepository.getTotalCaloriesBetweenDates(userId, weekStart, weekEnd);
            Integer avgCalories = totalCalories != null ? totalCalories.intValue() / 7 : 0;

            double weeklyTarget = targetCalories * 7;
            double complianceRate = 0.0;
            if (weeklyTarget > 0 && totalCalories != null) {
                complianceRate = Math.min((totalCalories / weeklyTarget) * 100.0, 100.0);
            }

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

    @Transactional(readOnly = true)
    public List<PersonalRecordResponse> getPersonalRecords(Long userId) {
        return getPersonalRecordsList(userId);
    }

    private List<PersonalRecordResponse> getPersonalRecordsList(Long userId) {
        List<Workout> workouts = workoutRepository.findByUserId(userId);

        List<PersonalRecordResponse> records = new ArrayList<>();
        workouts.stream()
                .flatMap(w -> w.getSets().stream())
                .collect(Collectors.groupingBy(ws -> ws.getExercise().getName()))
                .forEach((exerciseName, sets) -> {
                    WorkoutSet bestSet = sets.stream()
                            .max(Comparator.comparingDouble(this::estimatedOneRepMax))
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
                                .bestE1RM(round(estimatedOneRepMax(bestSet), 1))
                                .achievedDate(bestSet.getWorkout().getWorkoutDate())
                                .build());
                    }
                });

        return records;
    }

    /** Epley formula: weight * (1 + reps / 30). */
    private double estimatedOneRepMax(WorkoutSet set) {
        return set.getWeightKg().doubleValue() * (1.0 + set.getReps() / 30.0);
    }

    private double round(double value, int places) {
        double factor = Math.pow(10, places);
        return Math.round(value * factor) / factor;
    }

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

        BodyMetrics metrics = BodyMetrics.builder()
                .userId(userId)
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

        if (!metrics.getUserId().equals(userId)) {
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

        if (!metrics.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Body metrics not found for this user");
        }

        bodyMetricsRepository.delete(metrics);
    }

    private BodyMetricsResponse convertToBodyMetricsResponse(BodyMetrics metrics) {
        return BodyMetricsResponse.builder()
                .id(metrics.getId())
                .userId(metrics.getUserId())
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
     * Consistency streak = number of consecutive calendar days (ending yesterday or today)
     * on which the user completed at least one workout. Multiple workouts on the same day
     * count as one; a single missed day breaks the streak.
     */
    Integer calculateConsistencyStreak(Long userId) {
        List<Workout> workouts = workoutRepository.findTop30ByUserIdOrderByWorkoutDateDesc(userId);
        if (workouts.isEmpty()) return 0;

        TreeSet<LocalDate> dates = workouts.stream()
                .map(Workout::getWorkoutDate)
                .collect(Collectors.toCollection(TreeSet::new));

        LocalDate today = LocalDate.now();
        LocalDate cursor;
        if (dates.contains(today)) {
            cursor = today;
        } else if (dates.contains(today.minusDays(1))) {
            cursor = today.minusDays(1);
        } else {
            return 0;
        }

        int streak = 0;
        while (dates.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    Integer calculateBestStreak(Long userId) {
        List<Workout> workouts = workoutRepository.findByUserIdOrderByWorkoutDateAsc(userId);
        if (workouts.isEmpty()) return 0;

        TreeSet<LocalDate> dates = workouts.stream()
                .map(Workout::getWorkoutDate)
                .collect(Collectors.toCollection(TreeSet::new));

        int maxStreak = 0;
        int currentStreak = 0;
        LocalDate previous = null;
        for (LocalDate date : dates) {
            if (previous == null || date.equals(previous.plusDays(1))) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
            maxStreak = Math.max(maxStreak, currentStreak);
            previous = date;
        }
        return maxStreak;
    }

    private Double calculateCalorieCompliance(Long userId, UserProfile profile, BigDecimal currentWeight) {
        if (profile == null) return 0.0;
        double target = nutritionCalculator.targetCalories(profile, currentWeight);
        if (target <= 0) return 0.0;

        LocalDate startDate = LocalDate.now().minusDays(30);
        LocalDate endDate = LocalDate.now();
        Double actual = nutritionLogRepository.getAverageCaloriesBetweenDates(userId, startDate, endDate);
        if (actual == null) return 0.0;
        return Math.min((actual / target) * 100.0, 100.0);
    }

    private Double calculateProteinCompliance(Long userId, UserProfile profile, BigDecimal currentWeight) {
        if (profile == null) return 0.0;
        double target = nutritionCalculator.targetProteinGrams(
                nutritionCalculator.targetCalories(profile, currentWeight));
        if (target <= 0) return 0.0;

        LocalDate startDate = LocalDate.now().minusDays(30);
        LocalDate endDate = LocalDate.now();
        Double actual = nutritionLogRepository.getAverageProteinBetweenDates(userId, startDate, endDate);
        if (actual == null) return 0.0;
        return Math.min((actual / target) * 100.0, 100.0);
    }
}
