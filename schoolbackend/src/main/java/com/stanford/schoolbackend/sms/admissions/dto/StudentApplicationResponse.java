package com.stanford.schoolbackend.sms.admissions.dto;

import com.stanford.schoolbackend.sms.admissions.ApplicationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
public class StudentApplicationResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private Long desiredGradeLevelId;
    private String desiredGradeLevelName;
    private String guardianName;
    private String guardianEmail;
    private String guardianPhone;
    private String studentEmail;
    private String previousSchool;
    private String notes;
    private ApplicationStatus status;
    private Instant submittedAt;
    private Instant decidedAt;
    private Long enrolledStudentId;
}