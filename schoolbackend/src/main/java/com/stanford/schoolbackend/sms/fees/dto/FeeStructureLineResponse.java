package com.stanford.schoolbackend.sms.fees.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class FeeStructureLineResponse {
    private Long id;
    private Long gradeLevelId;
    private String gradeLevelName;
    private Long feeItemId;
    private String feeItemName;
    private BigDecimal amount;
}