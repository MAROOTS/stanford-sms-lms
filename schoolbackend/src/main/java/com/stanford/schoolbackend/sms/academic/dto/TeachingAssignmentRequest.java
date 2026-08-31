package com.stanford.schoolbackend.sms.academic.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TeachingAssignmentRequest {
    @NotNull
    private Long teacherId;
    @NotNull
    private Long subjectId;
    @NotNull
    private Long classSectionId;
}