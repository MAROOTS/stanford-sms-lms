package com.stanford.schoolbackend.core.notification.dto;

import com.stanford.schoolbackend.core.enums.NotificationType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationPreferenceResponse {
    private NotificationType type;
    private String label;
    private boolean enabled;
}