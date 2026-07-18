package com.stanford.schoolbackend.sms.exams;

import com.stanford.schoolbackend.core.enums.NotificationType;
import com.stanford.schoolbackend.core.enums.UserRole;
import com.stanford.schoolbackend.core.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
@RequiredArgsConstructor
public class TermReminderScheduler {

    private final TermRepository termRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 7 * * *") // 7am daily
    public void checkEndingTerms() {
        LocalDate today = LocalDate.now();
        LocalDate cutoff = today.plusDays(14);

        for (Term term : termRepository.findAll()) {
            if (term.isEndingSoonNotified() || term.getEndDate() == null) continue;
            if (term.getEndDate().isBefore(today) || term.getEndDate().isAfter(cutoff)) continue;

            long daysLeft = ChronoUnit.DAYS.between(today, term.getEndDate());
            notificationService.notifyRole(UserRole.ADMIN, NotificationType.TERM_REMINDER,
                    term.getName() + " ends in " + daysLeft + " day" + (daysLeft == 1 ? "" : "s") + ".",
                    "/terms");

            term.setEndingSoonNotified(true);
            termRepository.save(term);
        }
    }
}