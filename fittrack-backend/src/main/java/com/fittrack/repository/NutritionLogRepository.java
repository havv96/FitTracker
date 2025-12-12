package com.fittrack.repository;

import com.fittrack.model.NutritionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface NutritionLogRepository extends JpaRepository<NutritionLog, Long> {

    List<NutritionLog> findByUserIdAndLogDateOrderByLoggedAtAsc(Long userId, LocalDate logDate);

    List<NutritionLog> findByUserIdAndLogDateBetweenOrderByLogDateDesc(Long userId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(n.totalCalories) FROM NutritionLog n WHERE n.userId = :userId AND n.logDate = :date")
    Double getTotalCaloriesForDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT SUM(n.totalProteinG) FROM NutritionLog n WHERE n.userId = :userId AND n.logDate = :date")
    Double getTotalProteinForDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT SUM(n.totalCarbsG) FROM NutritionLog n WHERE n.userId = :userId AND n.logDate = :date")
    Double getTotalCarbsForDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT SUM(n.totalFatG) FROM NutritionLog n WHERE n.userId = :userId AND n.logDate = :date")
    Double getTotalFatForDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    void deleteByUserIdAndId(Long userId, Long id);

    @Query("SELECT SUM(n.totalCalories) FROM NutritionLog n WHERE n.userId = :userId AND n.logDate BETWEEN :startDate AND :endDate")
    Double getTotalCaloriesBetweenDates(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT AVG(dailyTotal.calories) FROM (SELECT SUM(n.totalCalories) as calories FROM NutritionLog n WHERE n.userId = :userId AND n.logDate BETWEEN :startDate AND :endDate GROUP BY n.logDate) dailyTotal")
    Double getAverageCaloriesBetweenDates(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT AVG(dailyTotal.protein) FROM (SELECT SUM(n.totalProteinG) as protein FROM NutritionLog n WHERE n.userId = :userId AND n.logDate BETWEEN :startDate AND :endDate GROUP BY n.logDate) dailyTotal")
    Double getAverageProteinBetweenDates(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
