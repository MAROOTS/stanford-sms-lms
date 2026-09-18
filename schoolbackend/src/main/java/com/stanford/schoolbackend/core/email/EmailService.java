package com.stanford.schoolbackend.core.email;

import com.stanford.schoolbackend.core.leads.ContactInquiry;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URI;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.mail.sales-inbox}")
    private String salesInbox;

    public void sendPasswordResetEmail(String to, String token, String publicBaseUrl) {
        String base = sanitizeBase(publicBaseUrl);
        String link = base + "/reset-password?token=" + token;
        String body = "You requested a password reset.\n\n"
                + "Set a new password:\n" + link
                + "\n\nThis link expires in 1 hour. If you did not request this, ignore this email.";
        send(to, "Reset your StanfordOS password", body);
    }

    public void sendVerificationEmail(String to, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;
        String body = "Welcome to SchoolOS!\n\n"
                + "Please verify your email address by clicking the link below:\n" + link
                + "\n\nThis link expires in 24 hours.";
        send(to, "Verify your StanfordOS email", body);
    }
    public void sendContactInquiryNotification(ContactInquiry inquiry) {
        String subject = "New inquiry: " + inquiry.getSchoolName();
        String body = "New contact form submission.\n\n"
                + "School: " + inquiry.getSchoolName() + "\n"
                + "Contact: " + inquiry.getContactName() + "\n"
                + "Email: " + inquiry.getEmail() + "\n"
                + "Phone: " + (inquiry.getPhone() != null ? inquiry.getPhone() : "not provided") + "\n"
                + "Estimated students: " + (inquiry.getStudentCountEstimate() != null ? inquiry.getStudentCountEstimate() : "not provided") + "\n\n"
                + "Message:\n" + inquiry.getMessage();
        send(salesInbox, subject, body);
    }
    private String sanitizeBase(String candidate) {
        String fallback = frontendUrl == null ? "https://stanfordos.co.ke" : frontendUrl.replaceAll("/$", "");
        if (candidate == null || candidate.isBlank()) return fallback;
        try {
            URI u = URI.create(candidate.trim());
            String host = u.getHost() == null ? "" : u.getHost().toLowerCase();
            if ("stanfordos.co.ke".equals(host) || host.endsWith(".stanfordos.co.ke")) {
                return "https://" + host;
            }
        } catch (Exception ignored) {}
        return fallback;
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