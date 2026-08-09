package com.stanford.schoolbackend.sms.admissions.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EnrollApplicationResponse {
    private Long studentId;
    private String username;
    private String temporaryPassword;
}