package com.stanford.schoolbackend.core.notification;

import com.stanford.schoolbackend.core.enums.NotificationType;
import com.stanford.schoolbackend.core.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "notifications")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String message;

    private String link; // optional frontend route, e.g. "/students"

    @Builder.Default
    private boolean read = false;

    @Builder.Default
    private Instant createdAt = Instant.now();
}