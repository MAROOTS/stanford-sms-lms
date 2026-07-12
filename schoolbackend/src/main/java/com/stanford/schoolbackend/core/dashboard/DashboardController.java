package com.stanford.schoolbackend.core.dashboard;

import com.stanford.schoolbackend.core.dashboard.dto.AttendanceTrendPoint;
import com.stanford.schoolbackend.core.dashboard.dto.DashboardSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<DashboardSummaryResponse> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/attendance-trend")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<List<AttendanceTrendPoint>> getAttendanceTrend(
            @RequestParam(defaultValue = "WEEK") String range,
            @RequestParam(required = false) Long termId) {
        return ResponseEntity.ok(dashboardService.getAttendanceTrend(range, termId));
    }
}