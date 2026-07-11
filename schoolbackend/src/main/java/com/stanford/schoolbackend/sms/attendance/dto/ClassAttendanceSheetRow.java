package com.stanford.schoolbackend.sms.attendance.dto;

import com.stanford.schoolbackend.core.enums.AttendanceStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClassAttendanceSheetRow {
    private Long studentId;
    private String studentName;
    private AttendanceStatus status; // null if not yet marked
}