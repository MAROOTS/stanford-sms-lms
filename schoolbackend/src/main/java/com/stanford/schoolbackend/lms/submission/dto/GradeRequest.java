package com.stanford.schoolbackend.lms.submission.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GradeRequest {
    @NotNull(message = "grade is required")
    @Min(value = 0, message = "grade cannot be negative")
    private Integer grade;

    private String feedback;
}