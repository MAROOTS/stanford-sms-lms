package com.stanford.schoolbackend.sms.attendance.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class SessionResponse {
    private Long id;
    private Long courseId;
    private String courseTitle;
    private LocalDate sessionDate;
    private String topic;
}