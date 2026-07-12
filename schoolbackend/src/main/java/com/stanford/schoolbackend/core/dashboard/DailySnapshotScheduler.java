package com.stanford.schoolbackend.core.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DailySnapshotScheduler {

    private final DashboardService dashboardService;

    @Scheduled(cron = "0 55 23 * * *") // 11:55pm daily — locks in the day's final numbers
    public void captureEndOfDaySnapshot() {
        dashboardService.captureSnapshot(LocalDate.now());
    }
}