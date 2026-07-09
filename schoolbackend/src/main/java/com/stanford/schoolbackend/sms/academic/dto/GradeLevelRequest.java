package com.stanford.schoolbackend.sms.academic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GradeLevelRequest {
    @NotBlank(message = "name is required")
    private String name;
    private  String stage;
    @NotNull(message = "sortOrder is required")
    private Integer sortOrder;
}