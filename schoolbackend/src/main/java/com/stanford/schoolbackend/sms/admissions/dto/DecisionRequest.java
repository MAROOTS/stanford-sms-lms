package com.stanford.schoolbackend.sms.admissions.dto;

import com.stanford.schoolbackend.sms.admissions.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DecisionRequest {
    @NotNull(message = "status is required")
    private ApplicationStatus status;

    private String notes;
}