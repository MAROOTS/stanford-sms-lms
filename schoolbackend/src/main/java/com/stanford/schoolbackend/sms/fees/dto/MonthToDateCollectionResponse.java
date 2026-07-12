package com.stanford.schoolbackend.sms.fees.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class MonthToDateCollectionResponse {
    private LocalDate asOfDate;
    private BigDecimal totalCollected;
}