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
    private String qualification;
    private String department;
    private String phone;
    private String tscNumber;
    private String nationalId;
    private LocalDate dateOfBirth;
    private String gender;
    private LocalDate dateOfEmployment;
    private String address;
}