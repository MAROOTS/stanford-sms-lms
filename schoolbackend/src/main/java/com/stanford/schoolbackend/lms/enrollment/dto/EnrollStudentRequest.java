package com.stanford.schoolbackend.lms.enrollment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EnrollStudentRequest {
    @NotNull(message = "studentId is required")
    private Long studentId;
}