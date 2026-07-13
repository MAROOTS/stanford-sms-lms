package com.stanford.schoolbackend.sms.library.dto;

import com.stanford.schoolbackend.core.enums.CopyStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateCopyStatusRequest {
    @NotNull(message = "status is required")
    private CopyStatus status; // LOST, DAMAGED, or AVAILABLE only — BORROWED is set only via issuing a loan
}