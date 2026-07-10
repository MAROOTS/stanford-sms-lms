package com.stanford.schoolbackend.sms.academic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubjectRequest {
    @NotBlank(message = "name is required")
    private String name;

    private String code;
}