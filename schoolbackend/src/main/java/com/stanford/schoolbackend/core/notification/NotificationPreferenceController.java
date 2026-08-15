package com.stanford.schoolbackend.core.notification;

import com.stanford.schoolbackend.core.notification.dto.NotificationPreferenceResponse;
import com.stanford.schoolbackend.core.notification.dto.UpdateNotificationPreferencesRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notification-preferences")
@RequiredArgsConstructor
public class NotificationPreferenceController {

    private final NotificationPreferenceService notificationPreferenceService;

    @GetMapping
    public ResponseEntity<List<NotificationPreferenceResponse>> listForCurrentUser() {
        return ResponseEntity.ok(notificationPreferenceService.listForCurrentUser());
    }

    @PutMapping
    public ResponseEntity<Void> updatePreferences(@RequestBody UpdateNotificationPreferencesRequest request) {
        notificationPreferenceService.updatePreferences(request);
        return ResponseEntity.noContent().build();
    }
}