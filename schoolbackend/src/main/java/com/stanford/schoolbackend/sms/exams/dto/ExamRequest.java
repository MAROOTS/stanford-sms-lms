package com.stanford.schoolbackend.sms.exams.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ExamRequest {
    @NotBlank(message = "name is required")
    private String name;

    @NotBlank(message = "examType is required")
    private String examType;

    @NotNull(message = "termId is required")
    private Long termId;

    @NotEmpty(message = "at least one classSectionId is required")
    private List<Long> classSectionIds;

    @NotEmpty(message = "at least one subjectId is required")
    private List<Long> subjectIds;
}