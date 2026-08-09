package com.fittrack.repository;

import com.fittrack.model.ReminderLog;
import com.fittrack.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /**
     * Returns users who (a) have no workout on or after {@code inactiveThreshold} and
     * (b) have not received a reminder of {@code reminderType} at or after {@code reminderSince}.
     *
     * <p>Because reminders sent inside the caller's loop mutate the filter's second condition,
     * paginate by always requesting page 0 and looping until the result is empty — later pages
     * are no longer valid once earlier ones have been processed.</p>
     */
    @Query("SELECT u.id AS id, u.email AS email FROM User u " +
           "WHERE NOT EXISTS (" +
           "  SELECT 1 FROM Workout w WHERE w.userId = u.id AND w.workoutDate >= :inactiveThreshold" +
           ") AND NOT EXISTS (" +
           "  SELECT 1 FROM ReminderLog r WHERE r.userId = u.id " +
           "    AND r.reminderType = :reminderType AND r.sentAt >= :reminderSince" +
           ")")
    Page<InactiveUserProjection> findInactiveUsersNeedingReminder(
            @Param("inactiveThreshold") LocalDate inactiveThreshold,
            @Param("reminderType") ReminderLog.ReminderType reminderType,
            @Param("reminderSince") LocalDateTime reminderSince,
            Pageable pageable);
}
