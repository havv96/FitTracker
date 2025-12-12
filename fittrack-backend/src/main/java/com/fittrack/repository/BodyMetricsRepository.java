package com.fittrack.repository;

import com.fittrack.model.BodyMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for BodyMetrics entity
 */
@Repository
public interface BodyMetricsRepository extends JpaRepository<BodyMetrics, Long> {

    List<BodyMetrics> findByUserIdOrderByDateDesc(Long userId);

    List<BodyMetrics> findByUserIdAndDateBetweenOrderByDateDesc(Long userId, LocalDate startDate, LocalDate endDate);

    Optional<BodyMetrics> findByUserIdAndDate(Long userId, LocalDate date);

    @Query("SELECT b FROM BodyMetrics b WHERE b.user.id = :userId ORDER BY b.date DESC")
    List<BodyMetrics> findLatestByUserId(@Param("userId") Long userId);

    Optional<BodyMetrics> findFirstByUserIdOrderByDateDesc(Long userId);
}
