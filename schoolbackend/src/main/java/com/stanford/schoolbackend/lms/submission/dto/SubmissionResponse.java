package com.stanford.schoolbackend.lms.submission.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class SubmissionResponse {
    private Long id;
    private Long assignmentId;
    private Long studentId;
    private String studentName;
    private String textContent;
    private String fileUrl;
    private Instant submittedAt;
    private Integer grade;
    private String feedback;
    private Instant gradedAt;
}