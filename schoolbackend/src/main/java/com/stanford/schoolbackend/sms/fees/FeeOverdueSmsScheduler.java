package com.stanford.schoolbackend.sms.fees;

import com.stanford.schoolbackend.sms.communication.CommunicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class FeeOverdueSmsScheduler {

    private final FeeInvoiceRepository feeInvoiceRepository;
    private final FeePaymentRepository feePaymentRepository;
    private final CommunicationService communicationService;

    @Scheduled(cron = "0 0 8 * * MON-FRI")
    public void remind() {
        LocalDate today = LocalDate.now();
        for (FeeInvoice inv : feeInvoiceRepository.findDueBefore(today)) {
            if (inv.getLastOverdueReminderAt() != null
                    && inv.getLastOverdueReminderAt()
                    .isAfter(Instant.now().minus(Duration.ofDays(3)))) {
                continue;
            }
            BigDecimal due = balance(inv);
            if (due.compareTo(BigDecimal.ZERO) <= 0) continue;

            communicationService.smsParentsOfStudent(
                    inv.getStudent(),
                    "Fee reminder",
                    "Hello {{parentName}}, {{studentName}} has an overdue balance of KES "
                            + due + ". Please pay or visit the school. {{schoolName}}"
            );
            inv.setLastOverdueReminderAt(Instant.now());
            feeInvoiceRepository.save(inv);
        }
    }

    private BigDecimal balance(FeeInvoice invoice) {
        BigDecimal billed = invoice.getLineItems().stream()
                .map(FeeInvoiceLineItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal paid = feePaymentRepository.findByInvoiceId(invoice.getId()).stream()
                .map(FeePayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return billed.subtract(paid);
    }
}