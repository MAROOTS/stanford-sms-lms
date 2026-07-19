package com.stanford.schoolbackend.sms.teacher.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TeacherUpdateRequest {
    @NotBlank(message = "firstName is required")
    private String firstName;

    @NotBlank(message = "lastName is required")
    private String lastName;

    @NotBlank(message = "email is required")
    @Email(message = "email must be valid")
    private String email;

    private String employeeId;
    private String qualification;
    private String department;
    private String designation;
    private LocalDate joinDate;
    private LocalDate dateOfBirth;
    private String gender;
    private String nationality;
    private String address;
    private String city;
    private String stateProvince;
    private String postalCode;
    private String country;
    private String phoneNumber;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String bio;
    private String photoUrl;
}
