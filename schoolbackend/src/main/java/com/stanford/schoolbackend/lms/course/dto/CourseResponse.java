package com.stanford.schoolbackend.lms.course.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private Long teacherId;
    private String teacherName;
    private Instant createdAt;
}