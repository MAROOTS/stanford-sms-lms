package com.stanford.schoolbackend.sms.fees.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class GenerateInvoicesRequest {
    @NotNull
    private Long termId;
    /** null = all students in the school */
    private Long classSectionId;
    @NotEmpty
    private List<Long> feeItemIds;
    private LocalDate dueDate;
}