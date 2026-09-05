package com.stanford.schoolbackend.sms.student.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class StudentResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Long classSectionId;
    private String classSectionName;
    private String gradeLevelName;
    private String admissionNumber;
    private String rollNumber;
    private String parentContactNumber;

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
    private String photoUrl;
}