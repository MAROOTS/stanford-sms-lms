package com.stanford.schoolbackend.sms.library.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class BookLoanResponse {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String copyCode;
    private Long borrowerId;
    private String borrowerName;
    private String borrowerRole;
    private LocalDate borrowedDate;
    private LocalDate dueDate;
    private LocalDate returnedDate;
    private String status; // BORROWED, OVERDUE, RETURNED
    private long daysOverdue;
}