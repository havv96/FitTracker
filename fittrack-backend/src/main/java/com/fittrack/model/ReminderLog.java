package com.fittrack.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Reminder Log Entity
 * Tracks system-sent reminders to prevent duplicates
 * Reference: US-17, FR-AI-01
 */
@Entity
@Table(name = "reminder_logs", indexes = {
        @Index(name = "idx_reminder_logs_user_sent", columnList = "user_id,sent_at"),
        @Index(name = "idx_reminder_logs_type_sent", columnList = "reminder_type,sent_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReminderLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "reminder_type", nullable = false, length = 50)
    private ReminderType reminderType;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    public ReminderLog(Long userId, ReminderType reminderType) {
        this.userId = userId;
        this.reminderType = reminderType;
        this.sentAt = LocalDateTime.now();
    }

    public enum ReminderType {
        INACTIVITY,
        WORKOUT_STREAK,
        WEIGHT_LOG_REMINDER,
        NUTRITION_REMINDER
    }
}
