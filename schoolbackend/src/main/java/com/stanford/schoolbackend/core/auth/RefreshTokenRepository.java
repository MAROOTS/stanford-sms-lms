package com.stanford.schoolbackend.core.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    List<RefreshToken> findByUserIdAndRevokedFalse(Long userId);
    List<RefreshToken> findByUserIdAndRevokedFalseAndExpiresAtAfter(Long userId, Instant now);
    @Modifying
    @Query("UPDATE RefreshToken t SET t.revoked = true WHERE t.revoked = false AND t.user.school.id = :schoolId")
    int revokeAllActiveBySchoolId(@Param("schoolId") Long schoolId);
}