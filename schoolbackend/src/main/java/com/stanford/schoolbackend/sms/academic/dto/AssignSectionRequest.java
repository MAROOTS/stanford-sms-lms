package com.stanford.schoolbackend.sms.academic.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignSectionRequest {
    @NotNull(message = "classSectionId is required")
    private Long classSectionId;
}