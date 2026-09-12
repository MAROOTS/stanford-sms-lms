package com.stanford.schoolbackend.core.auth;

import com.stanford.schoolbackend.core.auth.dto.SessionResponse;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-expiration-remember-ms}")
    private long rememberExpirationMs;

    @Value("${app.jwt.refresh-expiration-session-ms}")
    private long sessionExpirationMs;

    public String issue(User user, boolean remember, String ipAddress, String userAgent) {
        long validityMs = remember ? rememberExpirationMs : sessionExpirationMs;
        String raw = UUID.randomUUID().toString();
        RefreshToken token = RefreshToken.builder()
                .user(user)
                .token(hash(raw))
                .expiresAt(Instant.now().plusMillis(validityMs))
                .remember(remember)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();
        refreshTokenRepository.save(token);
        return raw;
    }
    private String hash(String rawToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            throw new IllegalStateException("Could not hash refresh token", e);
        }
    }
    /**
     * Validates a refresh token and immediately revokes it (rotation) —
     * every refresh produces a brand-new token, single-use.
     */
    public RefreshToken validateAndConsume(String tokenValue) {
        RefreshToken token = refreshTokenRepository.findByToken(hash(tokenValue))
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (token.isRevoked() || token.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Session expired — please log in again");
        }

        token.setRevoked(true);
        refreshTokenRepository.save(token);
        return token;
    }

    public void revoke(String tokenValue) {
        refreshTokenRepository.findByToken(hash(tokenValue)).ifPresent(t -> {
            t.setRevoked(true);
            refreshTokenRepository.save(t);
        });
    }

    public void revokeAllForUser(User user) {
        List<RefreshToken> tokens = refreshTokenRepository.findByUserIdAndRevokedFalse(user.getId());
        tokens.forEach(t -> t.setRevoked(true));
        refreshTokenRepository.saveAll(tokens);
    }
    public List<SessionResponse> listActiveSessions(User user, String currentTokenValue) {
        return refreshTokenRepository.findByUserIdAndRevokedFalseAndExpiresAtAfter(user.getId(), Instant.now()).stream()
                .map(t -> toSessionResponse(t, currentTokenValue))
                .toList();
    }

    public void revokeSessionForUser(User user, Long sessionId) {
        RefreshToken token = refreshTokenRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        if (!token.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only revoke your own sessions");
        }
        token.setRevoked(true);
        refreshTokenRepository.save(token);
    }

    private SessionResponse toSessionResponse(RefreshToken t, String currentTokenValue) {
        return SessionResponse.builder()
                .id(t.getId())
                .ipAddress(t.getIpAddress())
                .device(parseUserAgent(t.getUserAgent()))
                .createdAt(t.getCreatedAt())
                .expiresAt(t.getExpiresAt())
                .current(currentTokenValue != null && t.getToken().equals(hash(currentTokenValue)))
                .build();
    }

    private String parseUserAgent(String userAgent) {
        if (userAgent == null) return "Unknown device";
        String browser = "Unknown browser";
        if (userAgent.contains("Edg/")) browser = "Edge";
        else if (userAgent.contains("Chrome/")) browser = "Chrome";
        else if (userAgent.contains("Firefox/")) browser = "Firefox";
        else if (userAgent.contains("Safari/")) browser = "Safari";

        String os = "Unknown OS";
        if (userAgent.contains("Windows")) os = "Windows";
        else if (userAgent.contains("Mac OS")) os = "macOS";
        else if (userAgent.contains("Android")) os = "Android";
        else if (userAgent.contains("iPhone") || userAgent.contains("iPad")) os = "iOS";
        else if (userAgent.contains("Linux")) os = "Linux";

        return browser + " on " + os;
    }
}