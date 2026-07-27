package com.stanford.schoolbackend.core.auth;

import com.stanford.schoolbackend.core.user.User;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthEventLogService {

    private final AuthEventLogRepository authEventLogRepository;

    public void log(AuthEventType type, String usernameAttempted, User user, HttpServletRequest request) {
        authEventLogRepository.save(AuthEventLog.builder()
                .eventType(type)
                .usernameAttempted(usernameAttempted)
                .user(user)
                .ipAddress(request != null ? resolveIp(request) : null)
                .build());
    }

    private String resolveIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}