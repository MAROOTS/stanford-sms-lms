package com.stanford.schoolbackend.lms.enrollment.dto;

import com.stanford.schoolbackend.core.enums.EnrollmentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class EnrollmentResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long courseId;
    private String courseTitle;
    private EnrollmentStatus status;
    private Instant enrolledAt;
}