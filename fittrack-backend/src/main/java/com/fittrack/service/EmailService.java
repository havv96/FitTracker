package com.fittrack.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Email Service — sends transactional notifications. Strings come from messages.properties.
 * Reference: US-17, FR-AI-01
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final MessageSource messages;

    @Value("${spring.mail.from:noreply@fittrack.com}")
    private String fromEmail;

    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    public void sendInactivityReminder(String toEmail) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (!emailEnabled || mailSender == null) {
            log.info("Email sending is disabled or not configured. Would send inactivity reminder to: {}", toEmail);
            return;
        }
        send(mailSender, toEmail, msg("email.inactivity.subject"), msg("email.inactivity.body"),
                "inactivity reminder");
    }

    public void sendWorkoutStreakReminder(String toEmail, int streakDays) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (!emailEnabled || mailSender == null) {
            log.info("Email sending is disabled. Would send streak reminder to: {}", toEmail);
            return;
        }
        send(mailSender, toEmail,
                msg("email.streak.subject", streakDays),
                msg("email.streak.body", streakDays),
                "streak reminder");
    }

    public void sendNotificationEmail(String toEmail, String subject, String body) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (!emailEnabled || mailSender == null) {
            log.info("Email sending is disabled. Would send notification to: {}", toEmail);
            return;
        }
        send(mailSender, toEmail, subject, body, "notification");
    }

    private void send(JavaMailSender mailSender, String toEmail, String subject, String body, String kind) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Sent {} email to: {}", kind, toEmail);
        } catch (Exception e) {
            log.error("Failed to send {} email to: {}", kind, toEmail, e);
        }
    }

    private String msg(String key, Object... args) {
        return messages.getMessage(key, args, LocaleContextHolder.getLocale());
    }
}
