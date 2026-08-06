package com.stanford.schoolbackend.sms.library.dto;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;

@Data
@Builder
public class BookHoldResponse {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private Long borrowerId;
    private String borrowerName;
    private Instant requestedAt;
    private boolean notified;
    private boolean fulfilled;
}