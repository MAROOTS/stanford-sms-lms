package com.stanford.schoolbackend.sms.exams.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class TermResponse {
    private Long id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isCurrent;
}