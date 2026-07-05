package com.stanford.schoolbackend.sms.attendance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SessionRequest {
    @NotNull(message = "sessionDate is required")
    private LocalDate sessionDate;

    private String topic;
}