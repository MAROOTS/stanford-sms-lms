package com.stanford.schoolbackend.sms.fees.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class FeeInvoiceResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long termId;
    private String termName;
    private List<LineItemResponse> lineItems;
    private BigDecimal totalBilled;
    private BigDecimal totalPaid;
    private BigDecimal balance;
    private Instant createdAt;
    private LocalDate dueDate;

    @Data
    @Builder
    public static class LineItemResponse {
        private Long feeItemId;
        private String feeItemName;
        private BigDecimal amount;
    }
}