package com.stanford.schoolbackend.sms.fees.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FeeItemResponse {
    private Long id;
    private String name;
}