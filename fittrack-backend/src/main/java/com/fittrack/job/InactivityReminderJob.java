package com.fittrack.job;

import com.fittrack.model.ReminderLog;
import com.fittrack.model.User;
import com.fittrack.model.Workout;
import com.fittrack.repository.ReminderLogRepository;
import com.fittrack.repository.UserRepository;
import com.fittrack.repository.WorkoutRepository;
import com.fittrack.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Inactivity Reminder Job
 * Scheduled job to check for inactive users and send reminders
 * Reference: US-17, FR-AI-01
 */
@Component
@Slf4j
public class InactivityReminderJob {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private ReminderLogRepository reminderLogRepository;

    @Autowired
    private EmailService emailService;

    /**
     * US-17: Check for inactive users and send reminders
     * AC: Run daily at 10:00 AM
     * AC: Check if last workout > 3 days ago
     * AC: Limit to 1 reminder per 3 days
     *
     * Runs every day at 10:00 AM
     */
    @Scheduled(cron = "0 0 10 * * *")
    public void checkInactiveUsers() {
        log.info("Starting inactivity reminder job");

        LocalDate thresholdDate = LocalDate.now().minusDays(3);
        int remindersSent = 0;
        int usersChecked = 0;

        try {
            List<User> allUsers = userRepository.findAll();
            log.info("Checking {} users for inactivity", allUsers.size());

            for (User user : allUsers) {
                usersChecked++;

                // AC: Check if last workout > 3 days ago
                Optional<Workout> lastWorkout = workoutRepository.findTopByUserIdOrderByWorkoutDateDesc(user.getId());

                boolean isInactive = lastWorkout.isEmpty()
                        || lastWorkout.get().getWorkoutDate().isBefore(thresholdDate);

                if (isInactive) {
                    // AC: Check if already sent reminder recently (within last 3 days)
                    if (!wasReminderSentRecently(user.getId())) {
                        // AC: Send email reminder
                        emailService.sendInactivityReminder(user.getEmail());

                        // Log reminder sent
                        saveReminderLog(user.getId());
                        remindersSent++;

                        log.info("Sent inactivity reminder to user ID: {} (email: {})",
                                user.getId(), user.getEmail());
                    } else {
                        log.debug("Skipping user ID: {} - reminder already sent recently", user.getId());
                    }
                } else {
                    log.debug("User ID: {} is active - last workout: {}",
                            user.getId(), lastWorkout.get().getWorkoutDate());
                }
            }

            log.info("Inactivity reminder job completed. Checked: {} users, Sent: {} reminders",
                    usersChecked, remindersSent);

        } catch (Exception e) {
            log.error("Error during inactivity reminder job", e);
        }
    }

    /**
     * AC: Check if reminder was sent within last 3 days
     * Prevents spam by limiting to 1 reminder per 3 days
     */
    private boolean wasReminderSentRecently(Long userId) {
        LocalDateTime threeDaysAgo = LocalDateTime.now().minusDays(3);

        return reminderLogRepository.existsRecentReminder(
                userId,
                ReminderLog.ReminderType.INACTIVITY,
                threeDaysAgo
        );
    }

    /**
     * Save reminder log to database
     */
    private void saveReminderLog(Long userId) {
        ReminderLog reminderLog = new ReminderLog(userId, ReminderLog.ReminderType.INACTIVITY);
        reminderLogRepository.save(reminderLog);
        log.debug("Saved reminder log for user ID: {}", userId);
    }

    /**
     * Manual trigger for testing (can be called via admin endpoint)
     */
    public void triggerManually() {
        log.info("Manually triggered inactivity reminder job");
        checkInactiveUsers();
    }
}
