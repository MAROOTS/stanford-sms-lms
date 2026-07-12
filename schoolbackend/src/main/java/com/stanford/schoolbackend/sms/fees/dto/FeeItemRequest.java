package com.stanford.schoolbackend.sms.fees.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FeeItemRequest {
    @NotBlank(message = "name is required")
    private String name;
}