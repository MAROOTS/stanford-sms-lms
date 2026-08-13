package com.stanford.schoolbackend.core.leads.dto;

import com.stanford.schoolbackend.core.enums.ContactInquiryStatus;
import lombok.Builder;
import lombok.Data;
import java.time.Instant;

@Data
@Builder
public class ContactInquiryResponse {
    private Long id;
    private String schoolName;
    private String contactName;
    private String email;
    private String phone;
    private Integer studentCountEstimate;
    private String message;
    private ContactInquiryStatus status;
    private Instant submittedAt;
}