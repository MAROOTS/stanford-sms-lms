package com.stanford.schoolbackend.core.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    List<RefreshToken> findByUserIdAndRevokedFalse(Long userId);
    List<RefreshToken> findByUserIdAndRevokedFalseAndExpiresAtAfter(Long userId, Instant now);
}