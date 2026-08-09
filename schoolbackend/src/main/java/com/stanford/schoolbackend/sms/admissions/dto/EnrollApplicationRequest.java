package com.stanford.schoolbackend.sms.admissions.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EnrollApplicationRequest {
    @NotBlank(message = "username is required")
    private String username;

    @NotBlank(message = "password is required")
    private String password;

    @NotBlank(message = "confirmPassword is required")
    private String confirmPassword;
}