package com.stanford.schoolbackend.sms.library.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class IssueLoanRequest {
    @NotNull(message = "bookId is required")
    private Long bookId;

    @NotNull(message = "borrowerId is required")
    private Long borrowerId;

    private LocalDate dueDate; // optional — defaults to borrowedDate + configured loan period
}