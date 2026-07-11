package com.stanford.schoolbackend.sms.attendance.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class ClassSessionResponse {
    private Long id;
    private Long classSectionId;
    private String classSectionName;
    private LocalDate sessionDate;
    private String note;
}