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

    @jakarta.validation.constraints.Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "brandColor must be a valid hex color, e.g. #0f766e")
    private String brandColor;
}