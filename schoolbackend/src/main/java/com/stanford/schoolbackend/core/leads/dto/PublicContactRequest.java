package com.stanford.schoolbackend.core.leads.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PublicContactRequest {
    @NotBlank(message = "schoolName is required")
    private String schoolName;

    @NotBlank(message = "contactName is required")
    private String contactName;

    @NotBlank(message = "email is required")
    @Email(message = "email must be valid")
    private String email;

    private String phone;
    private Integer studentCountEstimate;

    @NotBlank(message = "message is required")
    private String message;

    // honeypot — real users never see or fill this field; bots that autofill every input will
    private String companyWebsite;
}