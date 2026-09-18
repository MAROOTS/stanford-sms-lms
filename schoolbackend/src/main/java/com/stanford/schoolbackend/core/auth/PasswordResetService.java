package com.stanford.schoolbackend.core.auth;

import com.stanford.schoolbackend.core.email.EmailService;
import com.stanford.schoolbackend.core.user.User;
import com.stanford.schoolbackend.core.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final Duration TOKEN_VALIDITY = Duration.ofHours(1);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final RefreshTokenService refreshTokenService;

    public void requestReset(String identifier, String publicBaseUrl) {
        String trimmed = identifier == null ? "" : identifier.trim();
        if (trimmed.isEmpty()) return;

        Optional<User> found = userRepository.findByEmailIgnoreCase(trimmed);
        if (found.isEmpty()) {
            found = userRepository.findByUsernameIgnoreCase(trimmed);
        }

        found.ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            tokenRepository.save(PasswordResetToken.builder()
                    .user(user)
                    .token(token)
                    .expiresAt(Instant.now().plus(TOKEN_VALIDITY))
                    .build());
            try {
                emailService.sendPasswordResetEmail(user.getEmail(), token, publicBaseUrl);
            } catch (Exception e) {
                org.slf4j.LoggerFactory.getLogger(PasswordResetService.class)
                        .error("Password reset email failed for {}", user.getEmail(), e);
            }
        });
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset link"));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Invalid or expired reset link");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        userRepository.save(user);
        refreshTokenService.revokeAllForUser(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
}