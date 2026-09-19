package com.stanford.schoolbackend.core.email;

import com.stanford.schoolbackend.core.leads.ContactInquiry;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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

        String body = """
                You requested a password reset.
                
                Set a new password by clicking the link below:
                %s
                
                This link expires in 1 hour. If you did not request this, please ignore this email.
                """.formatted(link);

        send(to, "Reset your StanfordOS password", body);
    }

    public void sendVerificationEmail(String to, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;

        String body = """
                Welcome to StanfordOS!
                
                Please verify your email address by clicking the link below:
                %s
                
                This link expires in 24 hours.
                """.formatted(link);

        send(to, "Verify your StanfordOS email", body);
    }

    public void sendContactInquiryNotification(ContactInquiry inquiry) {
        String subject = "New inquiry: " + inquiry.getSchoolName();
        String students = inquiry.getStudentCountEstimate() != null
                ? String.valueOf(inquiry.getStudentCountEstimate())
                : "Not provided";
        String phone = inquiry.getPhone() != null && !inquiry.getPhone().isBlank()
                ? inquiry.getPhone()
                : "Not provided";
        String message = inquiry.getMessage() != null ? inquiry.getMessage() : "";

        // Enhanced, modern, and email-safe HTML template
        String html = """
        <div style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="padding:40px 16px;">
            <tr><td align="center">
              <table role="presentation" width="100%%" max-width="600" cellspacing="0" cellpadding="0"
                     style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                <!-- Header -->
                <tr>
                  <td style="background-color:#0f172a;padding:32px 40px;text-align:center;">
                    <div style="color:#14b8a6;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">StanfordOS Platform</div>
                    <div style="color:#ffffff;font-size:24px;font-weight:600;margin:0;">New Demo Inquiry</div>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.6;">
                      A new contact form submission has been received from the marketing site.
                    </p>
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0"
                           style="border-collapse:collapse;font-size:15px;color:#0f172a;">
                      %s
                    </table>
                   \s
                    <div style="margin-top:32px;padding:20px;background-color:#f8fafc;border-radius:8px;border-left:4px solid #14b8a6;">
                      <div style="font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">Message Attached</div>
                      <div style="color:#334155;font-size:15px;line-height:1.6;white-space:pre-wrap;">%s</div>
                    </div>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color:#f1f5f9;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                    <p style="margin:0;font-size:13px;color:#64748b;">
                      Open the platform leads dashboard to update this inquiry's status.
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </div>
       \s""".formatted(
                row("School", esc(inquiry.getSchoolName()))
                        + row("Contact", esc(inquiry.getContactName()))
                        + row("Email", "<a href=\"mailto:" + esc(inquiry.getEmail()) + "\" style=\"color:#0f766e;text-decoration:none;font-weight:600;\">"
                        + esc(inquiry.getEmail()) + "</a>")
                        + row("Phone", esc(phone))
                        + row("Est. students", esc(students)),
                esc(message)
        );

        sendHtml(salesInbox, subject, html);
    }

    private static String row(String label, String value) {
        return """
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;width:140px;color:#64748b;font-weight:500;vertical-align:top;">%s</td>
          <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;font-weight:600;color:#0f172a;vertical-align:top;">%s</td>
        </tr>
        """.formatted(label, value);
    }

    private static String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }

    private void sendHtml(String to, String subject, String html) {
        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(mime);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to send email: " + e.getMessage(), e);
        }
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