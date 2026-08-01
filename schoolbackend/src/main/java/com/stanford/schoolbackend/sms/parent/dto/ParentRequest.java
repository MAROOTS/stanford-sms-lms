package com.stanford.schoolbackend.sms.parent.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParentRequest {
    @NotBlank(message = "firstName is required")
    private String firstName;

    @NotBlank(message = "lastName is required")
    private String lastName;

    @NotBlank(message = "email is required")
    @Email
    private String email;

    private String phoneNumber;

    private String occupation;

    private String alternatePhone;

    private String address;

    private List<Long> studentIds;

    private String relationship;

    private Boolean isPrimary;
}