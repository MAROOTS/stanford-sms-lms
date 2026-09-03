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

    private String admissionNumber;
    private String dateOfBirth;
    private String gender;
    private String nationality;
    private String guardianName;
    private String guardianPhone;
    private String guardianEmail;
    private String guardianRelationship;
    private String address;
    private String bloodGroup;
    private String allergies;
    private String medicalConditions;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String previousSchool;
}