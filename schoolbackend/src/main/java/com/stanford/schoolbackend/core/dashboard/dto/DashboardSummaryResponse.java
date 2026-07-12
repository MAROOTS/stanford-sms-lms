package com.stanford.schoolbackend.core.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class DashboardSummaryResponse {
    private LocalDate asOfDate;
    private int totalStudents;
    private Double totalStudentsChangePercent;
    private int totalTeachers;
    private Double totalTeachersChangePercent;
    private int activeClasses;
    private Double activeClassesChangePercent;
    private Double attendanceToday;
    private Double attendanceTodayChangePercent;
}