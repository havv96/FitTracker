package com.fittrack.repository;

import com.fittrack.model.DailyStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyStatsRepository extends JpaRepository<DailyStats, Long> {

    Optional<DailyStats> findByUserIdAndStatDate(Long userId, LocalDate statDate);

    List<DailyStats> findByUserIdAndStatDateBetweenOrderByStatDateAsc(Long userId, LocalDate startDate, LocalDate endDate);

    List<DailyStats> findByUserIdOrderByStatDateDesc(Long userId);

    @Query("SELECT d FROM DailyStats d WHERE d.userId = :userId AND d.weightKg IS NOT NULL " +
           "ORDER BY d.statDate DESC")
    List<DailyStats> findRecentWeightLogs(@Param("userId") Long userId);

    @Query("SELECT d FROM DailyStats d WHERE d.userId = :userId " +
           "AND d.statDate BETWEEN :startDate AND :endDate " +
           "AND d.weightKg IS NOT NULL " +
           "ORDER BY d.statDate ASC")
    List<DailyStats> findWeightLogsBetween(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}
