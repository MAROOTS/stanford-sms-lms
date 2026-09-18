package com.stanford.schoolbackend.core.school.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DeleteSchoolRequest {
    @NotBlank
    private String confirmationName;
}