package com.stanford.schoolbackend.core.auth;

import com.stanford.schoolbackend.core.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
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

    public RefreshToken issue(User user, boolean remember) {
        long validityMs = remember ? rememberExpirationMs : sessionExpirationMs;
        RefreshToken token = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiresAt(Instant.now().plusMillis(validityMs))
                .remember(remember)
                .build();
        return refreshTokenRepository.save(token);
    }

    /**
     * Validates a refresh token and immediately revokes it (rotation) —
     * every refresh produces a brand-new token, single-use.
     */
    public RefreshToken validateAndConsume(String tokenValue) {
        RefreshToken token = refreshTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (token.isRevoked() || token.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Session expired — please log in again");
        }

        token.setRevoked(true);
        refreshTokenRepository.save(token);
        return token;
    }

    public void revoke(String tokenValue) {
        refreshTokenRepository.findByToken(tokenValue).ifPresent(t -> {
            t.setRevoked(true);
            refreshTokenRepository.save(t);
        });
    }

    public void revokeAllForUser(User user) {
        List<RefreshToken> tokens = refreshTokenRepository.findByUserIdAndRevokedFalse(user.getId());
        tokens.forEach(t -> t.setRevoked(true));
        refreshTokenRepository.saveAll(tokens);
    }
}