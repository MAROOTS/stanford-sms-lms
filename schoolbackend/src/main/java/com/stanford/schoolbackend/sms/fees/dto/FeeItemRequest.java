package com.stanford.schoolbackend.sms.fees.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class FeeItemRequest {
    @NotBlank(message = "name is required")
    private String name;

    private BigDecimal defaultAmount;
}