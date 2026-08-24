package com.stanford.schoolbackend.sms.fees;

import com.stanford.schoolbackend.core.enums.NotificationType;
import com.stanford.schoolbackend.core.notification.NotificationService;
import com.stanford.schoolbackend.core.school.School;
import com.stanford.schoolbackend.core.school.SchoolRepository;
import com.stanford.schoolbackend.core.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
@RequiredArgsConstructor
public class FeeOverdueReminderScheduler {

    private static final int REMINDER_INTERVAL_DAYS = 7;

    private final FeeInvoiceRepository feeInvoiceRepository;
    private final FeePaymentRepository feePaymentRepository;
    private final NotificationService notificationService;
    private final SchoolRepository schoolRepository;
    private final TenantContext tenantContext;

    @Scheduled(cron = "0 0 8 * * *") // 8am daily
    public void sendOverdueReminders() {
        for (School school : schoolRepository.findAll()) {
            tenantContext.runAs(school.getId(), this::sendOverdueRemindersForCurrentSchool);
        }
    }

    private void sendOverdueRemindersForCurrentSchool() {
        LocalDate today = LocalDate.now();
        Instant reminderCutoff = Instant.now().minus(REMINDER_INTERVAL_DAYS, ChronoUnit.DAYS);

        for (FeeInvoice invoice : feeInvoiceRepository.findAll()) {
            if (invoice.getDueDate() == null || !invoice.getDueDate().isBefore(today)) continue;
            if (invoice.getLastOverdueReminderAt() != null && invoice.getLastOverdueReminderAt().isAfter(reminderCutoff)) continue;

            BigDecimal totalBilled = invoice.getLineItems().stream()
                    .map(FeeInvoiceLineItem::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalPaid = feePaymentRepository.findByInvoiceId(invoice.getId()).stream()
                    .map(FeePayment::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal balance = totalBilled.subtract(totalPaid);

            if (balance.compareTo(BigDecimal.ZERO) <= 0) continue;

            notificationService.notifyUser(invoice.getStudent(), NotificationType.FEE_OVERDUE,
                    "Your fee balance of KES " + balance + " for " + invoice.getTerm().getName() + " is overdue.",
                    "/my-fees");

            invoice.setLastOverdueReminderAt(Instant.now());
            feeInvoiceRepository.save(invoice);
        }
    }
}