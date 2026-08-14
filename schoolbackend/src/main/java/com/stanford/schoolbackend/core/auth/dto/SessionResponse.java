package com.stanford.schoolbackend.core.auth.dto;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;

@Data
@Builder
public class SessionResponse {
    private Long id;
    private String ipAddress;
    private String device;
    private Instant createdAt;
    private Instant expiresAt;
    private boolean current;
}