package com.stanford.schoolbackend.core.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class AttendanceTrendPoint {
    private LocalDate date;
    private Double attendancePercentage;
}