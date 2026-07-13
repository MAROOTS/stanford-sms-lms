package com.stanford.schoolbackend.sms.library.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddCopyRequest {
    @NotBlank(message = "copyCode is required")
    private String copyCode;
}