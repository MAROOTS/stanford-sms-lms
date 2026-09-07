package com.stanford.schoolbackend.sms.fees.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class FeeStructureLineRequest {
    @NotNull
    private Long feeItemId;
    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;
}