package com.stanford.schoolbackend.sms.student.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ImportRowResult {
    private int rowNumber;
    private String firstName;
    private String lastName;
    private String email;
    private String className;
    private boolean valid;
    private String errorMessage;
}