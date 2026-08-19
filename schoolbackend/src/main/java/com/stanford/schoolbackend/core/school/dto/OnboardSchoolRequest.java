package com.stanford.schoolbackend.core.school.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
    @Data
    public class OnboardSchoolRequest {
        @NotBlank
        private String schoolName;
        @NotBlank private String adminFirstName;
        @NotBlank private String adminLastName;
        @NotBlank @Email
        private String adminEmail;
    }

