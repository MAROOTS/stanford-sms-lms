package com.stanford.schoolbackend.sms.attendance.dto;

import com.stanford.schoolbackend.core.enums.AttendanceStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class MarkClassAttendanceRequest {
    @NotEmpty(message = "entries cannot be empty")
    private List<Entry> entries;

    @Data
    public static class Entry {
        @NotNull(message = "studentId is required")
        private Long studentId;

        @NotNull(message = "status is required")
        private AttendanceStatus status;
    }
}