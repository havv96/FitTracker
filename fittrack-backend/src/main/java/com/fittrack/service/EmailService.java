package com.fittrack.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Email Service
 * Handles sending email notifications to users
 * Reference: US-17, FR-AI-01
 */
@Service
@Slf4j
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@fittrack.com}")
    private String fromEmail;

    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    /**
     * US-17: Send inactivity reminder email
     * AC: Friendly reminder message after 3 days of inactivity
     */
    public void sendInactivityReminder(String toEmail) {
        if (!emailEnabled || mailSender == null) {
            log.info("Email sending is disabled or not configured. Would send inactivity reminder to: {}", toEmail);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Липсваш ни във FitTrack Pro! \uD83D\uDCAA");
            message.setText(buildInactivityReminderText());

            mailSender.send(message);
            log.info("Inactivity reminder email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send inactivity reminder email to: {}", toEmail, e);
        }
    }

    /**
     * Send workout streak reminder
     */
    public void sendWorkoutStreakReminder(String toEmail, int streakDays) {
        if (!emailEnabled || mailSender == null) {
            log.info("Email sending is disabled. Would send streak reminder to: {}", toEmail);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Поздравления! \uD83C\uDF89 " + streakDays + " дни серия!");
            message.setText(buildStreakReminderText(streakDays));

            mailSender.send(message);
            log.info("Streak reminder email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send streak reminder email to: {}", toEmail, e);
        }
    }

    /**
     * Send generic notification email
     */
    public void sendNotificationEmail(String toEmail, String subject, String body) {
        if (!emailEnabled || mailSender == null) {
            log.info("Email sending is disabled. Would send notification to: {}", toEmail);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            log.info("Notification email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send notification email to: {}", toEmail, e);
        }
    }

    private String buildInactivityReminderText() {
        return """
                Здравей! 👋

                Забелязахме, че не си тренирал/а напоследък във FitTrack Pro.

                Не губи постигнатия напредък! Всяка малка стъпка има значение.

                💪 Започни нова тренировка днес
                🥗 Проследи хранителния си режим
                📊 Виж своя прогрес

                Нека постигнем целите заедно!

                Екипът на FitTrack Pro
                """;
    }

    private String buildStreakReminderText(int streakDays) {
        return String.format("""
                Поздравления! 🎉

                Имаш %d дни активна серия във FitTrack Pro!

                Продължаваш да го правиш страхотно. Всеки ден те доближава до целите ти.

                Не спирай сега - ти си на прав път! 💪

                Продължавай така!

                Екипът на FitTrack Pro
                """, streakDays);
    }
}
