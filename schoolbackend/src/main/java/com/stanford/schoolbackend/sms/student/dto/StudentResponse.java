package com.stanford.schoolbackend.sms.student.dto;

import lombok.Builder;
import lombok.Data;

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
}