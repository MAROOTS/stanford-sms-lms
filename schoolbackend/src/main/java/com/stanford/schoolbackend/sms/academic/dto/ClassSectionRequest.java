package com.stanford.schoolbackend.sms.academic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ClassSectionRequest {
    @NotBlank(message = "name is required")
    private String name;

    @NotNull(message = "gradeLevelId is required")
    private Long gradeLevelId;

    private Long homeroomTeacherId; // optional
    private Integer capacity;
    private String roomNumber;
    private String academicYear;
    private String description;
}