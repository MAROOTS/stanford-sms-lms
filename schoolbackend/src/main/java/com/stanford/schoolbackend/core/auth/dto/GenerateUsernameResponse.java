package com.stanford.schoolbackend.core.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GenerateUsernameResponse {
    private String username;
}
