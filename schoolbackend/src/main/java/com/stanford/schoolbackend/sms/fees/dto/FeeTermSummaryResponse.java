package com.stanford.schoolbackend.sms.fees.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class FeeTermSummaryResponse {
    private Long termId;
    private String termName;
    private BigDecimal totalBilled;
    private BigDecimal totalCollected;
    private BigDecimal outstandingBalance;
    private List<MethodBreakdown> collectionByMethod;

    @Data
    @Builder
    public static class MethodBreakdown {
        private String method;
        private BigDecimal amount;
        private Double percentage;
    }
}