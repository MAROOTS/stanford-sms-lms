package com.stanford.schoolbackend.core.notification;

import com.stanford.schoolbackend.core.enums.NotificationType;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.core.notification.dto.NotificationPreferenceResponse;
import com.stanford.schoolbackend.core.notification.dto.UpdateNotificationPreferencesRequest;
import com.stanford.schoolbackend.core.user.User;
import com.stanford.schoolbackend.core.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationPreferenceService {

    private static final Map<NotificationType, String> LABELS = Map.ofEntries(
            Map.entry(NotificationType.STUDENT_REGISTERED, "New student registrations"),
            Map.entry(NotificationType.EXAM_RESULT, "Exam results posted"),
            Map.entry(NotificationType.ATTENDANCE_TAKEN, "Attendance taken"),
            Map.entry(NotificationType.FEE_PAYMENT, "Fee payments received"),
            Map.entry(NotificationType.TERM_REMINDER, "Term ending reminders"),
            Map.entry(NotificationType.GENERAL, "General notifications"),
            Map.entry(NotificationType.ANNOUNCEMENT, "School announcements"),
            Map.entry(NotificationType.FEE_OVERDUE, "Fee overdue reminders"),
            Map.entry(NotificationType.BOOK_HOLD_AVAILABLE, "Library book holds available"),
            Map.entry(NotificationType.APPLICATION_SUBMITTED, "New admission applications")
    );

    private final NotificationPreferenceRepository notificationPreferenceRepository;
    private final UserRepository userRepository;

    public List<NotificationPreferenceResponse> listForCurrentUser() {
        User user = getCurrentUser();
        Map<NotificationType, Boolean> overrides = notificationPreferenceRepository.findByUserId(user.getId()).stream()
                .collect(java.util.stream.Collectors.toMap(NotificationPreference::getNotificationType, NotificationPreference::isEnabled));

        return LABELS.entrySet().stream()
                .map(e -> NotificationPreferenceResponse.builder()
                        .type(e.getKey())
                        .label(e.getValue())
                        .enabled(overrides.getOrDefault(e.getKey(), true))
                        .build())
                .toList();
    }

    public void updatePreferences(UpdateNotificationPreferencesRequest request) {
        User user = getCurrentUser();
        for (UpdateNotificationPreferencesRequest.Item item : request.getPreferences()) {
            NotificationPreference pref = notificationPreferenceRepository
                    .findByUserIdAndNotificationType(user.getId(), item.getType())
                    .orElse(NotificationPreference.builder().user(user).notificationType(item.getType()).build());
            pref.setEnabled(item.isEnabled());
            notificationPreferenceRepository.save(pref);
        }
    }

    public boolean isEnabled(User user, NotificationType type) {
        return notificationPreferenceRepository.findByUserIdAndNotificationType(user.getId(), type)
                .map(NotificationPreference::isEnabled)
                .orElse(true);
    }

    private User getCurrentUser() {
        return userRepository.findByUsername(SecurityUtils.currentUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}