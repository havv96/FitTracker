package com.fittrack.repository;

import com.fittrack.model.ReminderLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Reminder Log Repository
 * Data access for reminder tracking
 * Reference: US-17, FR-AI-01
 */
@Repository
public interface ReminderLogRepository extends JpaRepository<ReminderLog, Long> {

    /**
     * Find the most recent reminder of a specific type for a user
     */
    @Query("SELECT r FROM ReminderLog r WHERE r.userId = :userId " +
           "AND r.reminderType = :reminderType " +
           "ORDER BY r.sentAt DESC LIMIT 1")
    Optional<ReminderLog> findMostRecentReminder(@Param("userId") Long userId,
                                                   @Param("reminderType") ReminderLog.ReminderType reminderType);

    /**
     * Check if a reminder was sent recently (within the last N days)
     */
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END " +
           "FROM ReminderLog r WHERE r.userId = :userId " +
           "AND r.reminderType = :reminderType " +
           "AND r.sentAt >= :since")
    boolean existsRecentReminder(@Param("userId") Long userId,
                                  @Param("reminderType") ReminderLog.ReminderType reminderType,
                                  @Param("since") LocalDateTime since);

    /**
     * Count reminders sent to a user within a date range
     */
    Long countByUserIdAndReminderTypeAndSentAtBetween(Long userId,
                                                       ReminderLog.ReminderType reminderType,
                                                       LocalDateTime startDate,
                                                       LocalDateTime endDate);
}
