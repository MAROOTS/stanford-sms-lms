package com.stanford.schoolbackend.sms.student.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class StudentUpdateRequest {
    @NotBlank(message = "firstName is required")
    private String firstName;

    private String middleName;

    @NotBlank(message = "lastName is required")
    private String lastName;

    @NotBlank(message = "email is required")
    @Email(message = "email must be valid")
    private String email;

    private String rollNumber;
    private String admissionNumber;
    private Long classSectionId;

    // Personal
    private LocalDate dateOfBirth;
    private String gender;
    private String nationality;
    private String religion;

    // Contact & Address
    private String address;
    private String city;
    private String stateProvince;
    private String postalCode;
    private String country;
    private String phoneNumber;

    // Guardian
    private String guardianName;
    private String guardianRelationship;
    private String guardianEmail;
    private String guardianPhone;
    private String emergencyContactName;
    private String emergencyContactPhone;

    // Medical
    private String bloodGroup;
    private String medicalNotes;

    // Enrollment
    private LocalDate enrollmentDate;
    private String enrollmentStatus;
    private String previousSchool;

    // Photo
    private String photoUrl;
}
