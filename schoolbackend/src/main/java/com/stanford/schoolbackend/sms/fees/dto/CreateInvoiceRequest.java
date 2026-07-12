package com.stanford.schoolbackend.sms.fees.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateInvoiceRequest {
    @NotNull(message = "studentId is required")
    private Long studentId;

    @NotNull(message = "termId is required")
    private Long termId;

    @NotEmpty(message = "at least one line item is required")
    @Valid
    private List<LineItem> lineItems;

    @Data
    public static class LineItem {
        @NotNull(message = "feeItemId is required")
        private Long feeItemId;

        @NotNull(message = "amount is required")
        @DecimalMin(value = "0.01", message = "amount must be positive")
        private BigDecimal amount;
    }
}