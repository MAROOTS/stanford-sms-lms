package com.stanford.schoolbackend.lms.assignment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.Instant;

@Data
public class AssignmentRequest {
    @NotBlank(message = "title is required")
    private String title;

    private String description;
    private Instant dueDate;
    private Integer maxScore;
}