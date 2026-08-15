package com.stanford.schoolbackend.core.school.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateSchoolProfileRequest {
    @NotBlank private String name;
    private String address;
    @Email private String contactEmail;
    private String contactPhone;
}