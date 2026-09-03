package com.stanford.schoolbackend.sms.student.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class StudentUpdateRequest {
    @NotBlank(message = "firstName is required")
    private String firstName;

    @NotBlank(message = "lastName is required")
    private String lastName;

    @NotBlank(message = "email is required")
    @Email(message = "email must be valid")
    private String email;

    private Long classSectionId;
    private String admissionNumber;

    private LocalDate dateOfBirth;
    private String gender;
    private String nationality;
    private String religion;
    private LocalDate admissionDate;
    private String birthCertificateNo;
    private String address;
    private String guardianName;
    private String guardianPhone;
    private String guardianEmail;
    private String guardianRelationship;
    private String bloodGroup;
    private String allergies;
    private String medicalConditions;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String previousSchool;
    private String parentContactNumber;
    private String rollNumber;
}