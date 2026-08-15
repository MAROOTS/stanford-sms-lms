package com.stanford.schoolbackend.core.notification.dto;

import com.stanford.schoolbackend.core.enums.NotificationType;
import lombok.Data;
import java.util.List;

@Data
public class UpdateNotificationPreferencesRequest {
    private List<Item> preferences;

    @Data
    public static class Item {
        private NotificationType type;
        private boolean enabled;
    }
}