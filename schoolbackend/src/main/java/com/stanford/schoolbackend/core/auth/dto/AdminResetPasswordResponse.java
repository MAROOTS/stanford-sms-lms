package com.stanford.schoolbackend.core.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminResetPasswordResponse {
    private String username;
    private String temporaryPassword;
}
