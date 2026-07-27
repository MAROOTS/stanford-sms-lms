package com.stanford.schoolbackend.core.email;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String to, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        String body = "You requested a password reset for your SchoolOS account.\n\n"
                + "Click the link below to set a new password:\n" + link
                + "\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.";
        send(to, "Reset your SchoolOS password", body);
    }

    public void sendVerificationEmail(String to, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;
        String body = "Welcome to SchoolOS!\n\n"
                + "Please verify your email address by clicking the link below:\n" + link
                + "\n\nThis link expires in 24 hours.";
        send(to, "Verify your SchoolOS email", body);
    }

    private void send(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}