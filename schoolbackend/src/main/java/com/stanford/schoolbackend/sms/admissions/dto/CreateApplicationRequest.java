package com.stanford.schoolbackend.sms.admissions.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateApplicationRequest {
    @NotBlank(message = "firstName is required")
    private String firstName;

    @NotBlank(message = "lastName is required")
    private String lastName;

    private LocalDate dateOfBirth;

    private Long desiredGradeLevelId;

    @NotBlank(message = "guardianName is required")
    private String guardianName;

    @NotBlank(message = "guardianEmail is required")
    @Email(message = "guardianEmail must be valid")
    private String guardianEmail;

    @NotBlank(message = "guardianPhone is required")
    private String guardianPhone;

    @Email(message = "studentEmail must be valid")
    private String studentEmail;

    private String previousSchool;
    private String notes;
}