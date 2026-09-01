package com.stanford.schoolbackend.sms.student.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ImportedCredential {
    private String firstName;
    private String lastName;
    private String username;
    private String temporaryPassword;
    private String className;
}