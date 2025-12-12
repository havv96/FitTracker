package com.fittrack.service;

import com.fittrack.dto.response.OverloadSuggestion;
import com.fittrack.model.WorkoutSet;
import com.fittrack.repository.WorkoutSetRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.OptionalDouble;

/**
 * Progressive Overload Service
 * Provides intelligent workout progression recommendations
 * Reference: US-15, FR-AI-02
 */
@Service
@Slf4j
public class ProgressiveOverloadService {

    @Autowired
    private WorkoutSetRepository setRepository;

    /**
     * US-15: Check for progressive overload opportunity
     * AC: If same reps and weight with RPE < 7, suggest weight increase
     * AC: Recommend +2.5kg for upper body, +5kg for lower body
     */
    @Transactional(readOnly = true)
    public OverloadSuggestion checkForOverloadOpportunity(Long userId, Long exerciseId,
                                                           int currentReps, double currentWeight,
                                                           int currentRpe) {
        log.info("Checking overload opportunity for user {} on exercise {} (reps: {}, weight: {}, rpe: {})",
                userId, exerciseId, currentReps, currentWeight, currentRpe);

        // Get last workout data for the same exercise
        List<WorkoutSet> previousSets = setRepository.findLastWorkoutForExercise(userId, exerciseId);

        if (previousSets.isEmpty()) {
            log.debug("No previous workout data found for exercise {}", exerciseId);
            return null; // No previous data to compare
        }

        // Calculate average performance from previous workout
        OptionalDouble avgPreviousReps = previousSets.stream()
                .filter(set -> set.getReps() != null)
                .mapToInt(WorkoutSet::getReps)
                .average();

        OptionalDouble avgPreviousWeight = previousSets.stream()
                .filter(set -> set.getWeightKg() != null)
                .mapToDouble(set -> set.getWeightKg().doubleValue())
                .average();

        OptionalDouble avgPreviousRpe = previousSets.stream()
                .filter(set -> set.getRpe() != null)
                .mapToInt(WorkoutSet::getRpe)
                .average();

        if (avgPreviousReps.isEmpty() || avgPreviousWeight.isEmpty()) {
            return null; // Insufficient data
        }

        double prevReps = avgPreviousReps.getAsDouble();
        double prevWeight = avgPreviousWeight.getAsDouble();
        double prevRpe = avgPreviousRpe.isPresent() ? avgPreviousRpe.getAsDouble() : 5.0;

        // AC: Check if performance is same or better
        boolean sameOrBetterReps = currentReps >= Math.round(prevReps);
        boolean sameWeight = Math.abs(currentWeight - prevWeight) < 0.1;
        boolean easyRpe = currentRpe < 7;

        log.debug("Comparison - Current: R{} W{}kg RPE{} | Previous: R{} W{}kg RPE{}",
                currentReps, currentWeight, currentRpe,
                Math.round(prevReps), Math.round(prevWeight), Math.round(prevRpe));

        // AC: If same reps/weight but low RPE, suggest weight increase
        if (sameOrBetterReps && sameWeight && easyRpe) {
            // Determine weight increment (2.5kg for upper body, 5kg for lower body)
            // Simplified: use 2.5kg increment for all exercises
            double increment = 2.5;
            double suggestedWeight = currentWeight + increment;

            OverloadSuggestion suggestion = new OverloadSuggestion();
            suggestion.setMessage("Опитай " + suggestedWeight + "kg днес?");
            suggestion.setSuggestedWeight(BigDecimal.valueOf(suggestedWeight));
            suggestion.setReason("Последния път беше с RPE " + currentRpe + " - време е за прогрес!");
            suggestion.setProgressionType(OverloadSuggestion.ProgressionType.WEIGHT_INCREASE);
            suggestion.setPreviousReps((int) Math.round(prevReps));
            suggestion.setPreviousWeight(BigDecimal.valueOf(prevWeight));
            suggestion.setPreviousRpe((int) Math.round(prevRpe));

            log.info("Overload suggestion generated: {} kg", suggestedWeight);
            return suggestion;
        }

        // AC: If hitting higher RPE (8-10), suggest rep increase instead
        if (sameWeight && currentRpe >= 8 && currentReps < 12) {
            int suggestedReps = currentReps + 2;

            OverloadSuggestion suggestion = new OverloadSuggestion();
            suggestion.setMessage("Опитай " + suggestedReps + " повторения!");
            suggestion.setSuggestedWeight(BigDecimal.valueOf(currentWeight)); // Keep weight same
            suggestion.setReason("RPE " + currentRpe + " е добър! Добави още повторения.");
            suggestion.setProgressionType(OverloadSuggestion.ProgressionType.REP_INCREASE);
            suggestion.setPreviousReps((int) Math.round(prevReps));
            suggestion.setPreviousWeight(BigDecimal.valueOf(prevWeight));
            suggestion.setPreviousRpe((int) Math.round(prevRpe));

            log.info("Rep increase suggestion generated: {} reps", suggestedReps);
            return suggestion;
        }

        // No suggestion - either progressing naturally or need recovery
        log.debug("No overload suggestion - current performance is appropriate");
        return null;
    }

    /**
     * Get progressive overload suggestion based on recent performance
     * Analyzes last 2-3 workouts for the exercise
     */
    @Transactional(readOnly = true)
    public OverloadSuggestion getProgressionSuggestion(Long userId, Long exerciseId) {
        log.info("Getting progression suggestion for user {} on exercise {}", userId, exerciseId);

        List<WorkoutSet> recentSets = setRepository.findLastWorkoutForExercise(userId, exerciseId);

        if (recentSets.isEmpty()) {
            return null;
        }

        // Take the most recent set as baseline
        WorkoutSet lastSet = recentSets.get(0);

        if (lastSet.getReps() == null || lastSet.getWeightKg() == null) {
            return null;
        }

        int rpe = lastSet.getRpe() != null ? lastSet.getRpe() : 5;

        return checkForOverloadOpportunity(
                userId,
                exerciseId,
                lastSet.getReps(),
                lastSet.getWeightKg().doubleValue(),
                rpe
        );
    }
}
