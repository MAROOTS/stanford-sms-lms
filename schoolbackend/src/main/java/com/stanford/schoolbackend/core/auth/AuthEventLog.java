package com.stanford.schoolbackend.core.auth;

import com.stanford.schoolbackend.core.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "auth_event_logs")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class AuthEventLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String usernameAttempted;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // nullable — the attempted username might not match any real account

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthEventType eventType;

    private String ipAddress;

    @Builder.Default
    private Instant occurredAt = Instant.now();
}