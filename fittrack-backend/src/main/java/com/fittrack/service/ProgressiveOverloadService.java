package com.fittrack.service;

import com.fittrack.dto.response.OverloadSuggestion;
import com.fittrack.model.WorkoutSet;
import com.fittrack.repository.WorkoutSetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
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
@RequiredArgsConstructor
public class ProgressiveOverloadService {

    private final WorkoutSetRepository setRepository;
    private final MessageSource messages;

    @Transactional(readOnly = true)
    public OverloadSuggestion checkForOverloadOpportunity(Long userId, Long exerciseId,
                                                           int currentReps, double currentWeight,
                                                           int currentRpe) {
        log.info("Checking overload opportunity for user {} on exercise {} (reps: {}, weight: {}, rpe: {})",
                userId, exerciseId, currentReps, currentWeight, currentRpe);

        List<WorkoutSet> previousSets = setRepository.findLastWorkoutForExercise(userId, exerciseId);

        if (previousSets.isEmpty()) {
            log.debug("No previous workout data found for exercise {}", exerciseId);
            return null;
        }

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
            return null;
        }

        double prevReps = avgPreviousReps.getAsDouble();
        double prevWeight = avgPreviousWeight.getAsDouble();
        double prevRpe = avgPreviousRpe.isPresent() ? avgPreviousRpe.getAsDouble() : 5.0;

        boolean sameOrBetterReps = currentReps >= Math.round(prevReps);
        boolean sameWeight = Math.abs(currentWeight - prevWeight) < 0.1;
        boolean easyRpe = currentRpe < 7;

        log.debug("Comparison - Current: R{} W{}kg RPE{} | Previous: R{} W{}kg RPE{}",
                currentReps, currentWeight, currentRpe,
                Math.round(prevReps), Math.round(prevWeight), Math.round(prevRpe));

        if (sameOrBetterReps && sameWeight && easyRpe) {
            double increment = 2.5;
            double suggestedWeight = currentWeight + increment;

            OverloadSuggestion suggestion = new OverloadSuggestion();
            suggestion.setMessage(msg("overload.weight_increase.message", suggestedWeight));
            suggestion.setSuggestedWeight(BigDecimal.valueOf(suggestedWeight));
            suggestion.setReason(msg("overload.weight_increase.reason", currentRpe));
            suggestion.setProgressionType(OverloadSuggestion.ProgressionType.WEIGHT_INCREASE);
            suggestion.setPreviousReps((int) Math.round(prevReps));
            suggestion.setPreviousWeight(BigDecimal.valueOf(prevWeight));
            suggestion.setPreviousRpe((int) Math.round(prevRpe));

            log.info("Overload suggestion generated: {} kg", suggestedWeight);
            return suggestion;
        }

        if (sameWeight && currentRpe >= 8 && currentReps < 12) {
            int suggestedReps = currentReps + 2;

            OverloadSuggestion suggestion = new OverloadSuggestion();
            suggestion.setMessage(msg("overload.rep_increase.message", suggestedReps));
            suggestion.setSuggestedWeight(BigDecimal.valueOf(currentWeight));
            suggestion.setReason(msg("overload.rep_increase.reason", currentRpe));
            suggestion.setProgressionType(OverloadSuggestion.ProgressionType.REP_INCREASE);
            suggestion.setPreviousReps((int) Math.round(prevReps));
            suggestion.setPreviousWeight(BigDecimal.valueOf(prevWeight));
            suggestion.setPreviousRpe((int) Math.round(prevRpe));

            log.info("Rep increase suggestion generated: {} reps", suggestedReps);
            return suggestion;
        }

        log.debug("No overload suggestion - current performance is appropriate");
        return null;
    }

    @Transactional(readOnly = true)
    public OverloadSuggestion getProgressionSuggestion(Long userId, Long exerciseId) {
        log.info("Getting progression suggestion for user {} on exercise {}", userId, exerciseId);

        List<WorkoutSet> recentSets = setRepository.findLastWorkoutForExercise(userId, exerciseId);

        if (recentSets.isEmpty()) {
            return null;
        }

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

    private String msg(String key, Object... args) {
        return messages.getMessage(key, args, LocaleContextHolder.getLocale());
    }
}
