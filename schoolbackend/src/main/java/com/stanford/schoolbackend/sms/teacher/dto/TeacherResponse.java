package com.stanford.schoolbackend.sms.teacher.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeacherResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
}