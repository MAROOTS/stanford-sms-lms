package com.stanford.schoolbackend.sms.fees.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class FeePaymentResponse {
    private Long id;
    private Long invoiceId;
    private BigDecimal amount;
    private String method;
    private LocalDate paymentDate;
    private String reference;
}