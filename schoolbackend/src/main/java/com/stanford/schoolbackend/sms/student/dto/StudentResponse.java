package com.stanford.schoolbackend.sms.student.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class StudentResponse {
    private Long id;
    private String firstName;
    private String middleName;
    private String lastName;
    private String email;
    private String rollNumber;
    private String admissionNumber;
    private Long classSectionId;
    private String classSectionName;
    private String gradeLevelName;

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
