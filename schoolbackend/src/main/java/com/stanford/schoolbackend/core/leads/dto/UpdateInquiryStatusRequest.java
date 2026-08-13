package com.stanford.schoolbackend.core.leads.dto;

import com.stanford.schoolbackend.core.enums.ContactInquiryStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateInquiryStatusRequest {
    @NotNull(message = "status is required")
    private ContactInquiryStatus status;
}