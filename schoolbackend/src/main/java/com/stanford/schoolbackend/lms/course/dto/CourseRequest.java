package com.stanford.schoolbackend.lms.course.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CourseRequest {
    @NotBlank(message = "title is required")
    private String title;

    private String description;
}