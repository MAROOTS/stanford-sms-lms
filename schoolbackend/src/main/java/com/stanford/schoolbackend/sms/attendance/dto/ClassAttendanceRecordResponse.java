package com.stanford.schoolbackend.sms.attendance.dto;

import com.stanford.schoolbackend.core.enums.AttendanceStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class ClassAttendanceRecordResponse {
    private Long id;
    private Long classSessionId;
    private LocalDate sessionDate;
    private Long studentId;
    private String studentName;
    private AttendanceStatus status;
}