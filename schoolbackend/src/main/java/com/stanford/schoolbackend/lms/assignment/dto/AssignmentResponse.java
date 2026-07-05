package com.stanford.schoolbackend.lms.assignment.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class AssignmentResponse {
    private Long id;
    private Long courseId;
    private String courseTitle;
    private String title;
    private String description;
    private Instant dueDate;
    private Integer maxScore;
    private Instant createdAt;
}