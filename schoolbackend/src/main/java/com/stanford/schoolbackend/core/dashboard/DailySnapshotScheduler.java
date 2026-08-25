package com.stanford.schoolbackend.core.dashboard;

import com.stanford.schoolbackend.core.school.School;
import com.stanford.schoolbackend.core.school.SchoolRepository;
import com.stanford.schoolbackend.core.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DailySnapshotScheduler {

    private final DashboardService dashboardService;
    private final SchoolRepository schoolRepository;
    private final TenantContext tenantContext;

    @Scheduled(cron = "0 55 23 * * *") // 11:55pm daily
    public void captureEndOfDaySnapshot() {
        for (School school : schoolRepository.findAll()) {
            tenantContext.runAs(school.getId(), () -> dashboardService.captureSnapshot(school.getId(), LocalDate.now()));
        }
    }
}