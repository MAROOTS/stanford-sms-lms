package com.stanford.schoolbackend.sms.library.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PlaceHoldRequest {
    @NotNull(message = "borrowerId is required")
    private Long borrowerId;
}