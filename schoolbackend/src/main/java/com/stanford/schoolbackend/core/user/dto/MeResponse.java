package com.stanford.schoolbackend.core.user.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MeResponse {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
}