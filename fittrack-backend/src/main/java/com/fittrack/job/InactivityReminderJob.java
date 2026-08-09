package com.fittrack.job;

import com.fittrack.model.ReminderLog;
import com.fittrack.repository.InactiveUserProjection;
import com.fittrack.repository.ReminderLogRepository;
import com.fittrack.repository.UserRepository;
import com.fittrack.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Inactivity Reminder Job
 * Daily job that emails users whose most recent workout is older than 3 days and who
 * have not received a reminder in the last 3 days. Runs at 10:00 AM.
 * Reference: US-17, FR-AI-01
 */
@Component
@Slf4j
public class InactivityReminderJob {

    private static final int BATCH_SIZE = 100;
    /** Safety cap so a bug can't run the loop unbounded. 100 pages * 100 users = 10k reminders. */
    private static final int MAX_BATCHES = 100;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReminderLogRepository reminderLogRepository;

    @Autowired
    private EmailService emailService;

    @Scheduled(cron = "0 0 10 * * *")
    public void checkInactiveUsers() {
        LocalDate inactiveThreshold = LocalDate.now().minusDays(3);
        LocalDateTime reminderSince = LocalDateTime.now().minusDays(3);
        int remindersSent = 0;
        int batches = 0;

        log.info("Starting inactivity reminder job");
        try {
            while (batches < MAX_BATCHES) {
                Page<InactiveUserProjection> page = userRepository.findInactiveUsersNeedingReminder(
                        inactiveThreshold,
                        ReminderLog.ReminderType.INACTIVITY,
                        reminderSince,
                        PageRequest.of(0, BATCH_SIZE));

                if (page.isEmpty()) {
                    break;
                }

                for (InactiveUserProjection user : page.getContent()) {
                    emailService.sendInactivityReminder(user.getEmail());
                    reminderLogRepository.save(new ReminderLog(user.getId(), ReminderLog.ReminderType.INACTIVITY));
                    remindersSent++;
                    log.debug("Sent inactivity reminder to user ID: {}", user.getId());
                }
                batches++;
            }
            if (batches >= MAX_BATCHES) {
                log.warn("Reached max batches ({}), stopping. Reminders sent: {}", MAX_BATCHES, remindersSent);
            }
            log.info("Inactivity reminder job completed. Sent: {} reminders in {} batches",
                    remindersSent, batches);
        } catch (Exception e) {
            log.error("Error during inactivity reminder job (sent {} before failure)", remindersSent, e);
        }
    }

    /** Manual trigger for testing. */
    public void triggerManually() {
        log.info("Manually triggered inactivity reminder job");
        checkInactiveUsers();
    }
}
