package com.stanford.schoolbackend.sms.fees.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class FeeItemResponse {
    private Long id;
    private String name;
    private BigDecimal defaultAmount;
}