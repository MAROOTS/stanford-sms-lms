package com.stanford.schoolbackend.sms.teacher.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class TeacherResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;

    // Professional
    private String employeeId;
    private String qualification;
    private String department;
    private String designation;
    private LocalDate joinDate;

    // Personal
    private LocalDate dateOfBirth;
    private String gender;
    private String nationality;

    // Contact
    private String address;
    private String city;
    private String stateProvince;
    private String postalCode;
    private String country;
    private String phoneNumber;

    // Emergency
    private String emergencyContactName;
    private String emergencyContactPhone;

    // Notes
    private String bio;
    private String photoUrl;
}
