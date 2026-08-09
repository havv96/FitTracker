package com.fittrack.service;

import com.fittrack.exception.ResourceNotFoundException;
import com.fittrack.model.NutritionLog;
import com.fittrack.repository.DailyStatsRepository;
import com.fittrack.repository.FoodItemRepository;
import com.fittrack.repository.NutritionLogRepository;
import com.fittrack.repository.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NutritionServiceTest {

    @Mock private FoodItemRepository foodItemRepository;
    @Mock private NutritionLogRepository nutritionLogRepository;
    @Mock private UserProfileRepository profileRepository;
    @Mock private DailyStatsRepository dailyStatsRepository;
    @Mock private NutritionCalculator nutritionCalculator;

    @InjectMocks
    private NutritionService nutritionService;

    private NutritionLog otherUsersLog;
    private NutritionLog ownLog;

    @BeforeEach
    void setUp() {
        otherUsersLog = new NutritionLog();
        otherUsersLog.setId(42L);
        otherUsersLog.setUserId(999L);

        ownLog = new NutritionLog();
        ownLog.setId(7L);
        ownLog.setUserId(1L);
    }

    @Test
    void deleteNutritionLog_notFound_throws() {
        when(nutritionLogRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> nutritionService.deleteNutritionLog(1L, 42L));
        verify(nutritionLogRepository, never()).delete(any());
    }

    @Test
    void deleteNutritionLog_notOwned_throwsAndDoesNotDelete() {
        when(nutritionLogRepository.findById(42L)).thenReturn(Optional.of(otherUsersLog));

        assertThrows(ResourceNotFoundException.class,
                () -> nutritionService.deleteNutritionLog(1L, 42L));
        verify(nutritionLogRepository, never()).delete(any());
    }

    @Test
    void deleteNutritionLog_owned_deletesEntity() {
        when(nutritionLogRepository.findById(7L)).thenReturn(Optional.of(ownLog));

        nutritionService.deleteNutritionLog(1L, 7L);
        verify(nutritionLogRepository).delete(ownLog);
    }
}
