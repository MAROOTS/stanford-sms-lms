package com.stanford.schoolbackend.core.admin.dto;

import com.stanford.schoolbackend.core.enums.UserRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreatedUserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private UserRole role;
}