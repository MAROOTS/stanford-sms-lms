package com.stanford.schoolbackend.core.notification.dto;

import com.stanford.schoolbackend.core.enums.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String message;
    private String link;
    private boolean read;
    private Instant createdAt;
}