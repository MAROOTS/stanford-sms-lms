package com.stanford.schoolbackend.core.notification;

import com.stanford.schoolbackend.core.enums.NotificationType;
import com.stanford.schoolbackend.core.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notification_preferences", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "notification_type"}))
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false)
    private NotificationType notificationType;

    @Builder.Default
    private boolean enabled = true;
}