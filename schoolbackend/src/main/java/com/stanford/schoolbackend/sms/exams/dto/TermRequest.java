package com.stanford.schoolbackend.sms.exams.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TermRequest {
    @NotBlank(message = "name is required")
    private String name;

    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isCurrent;
}