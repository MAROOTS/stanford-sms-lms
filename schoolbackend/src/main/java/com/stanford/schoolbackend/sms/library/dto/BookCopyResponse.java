package com.stanford.schoolbackend.sms.library.dto;

import com.stanford.schoolbackend.core.enums.CopyStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookCopyResponse {
    private Long id;
    private Long bookId;
    private String copyCode;
    private CopyStatus status;
}