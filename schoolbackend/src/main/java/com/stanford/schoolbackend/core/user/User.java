package com.stanford.schoolbackend.core.user;

import com.stanford.schoolbackend.core.enums.UserRole;
import com.stanford.schoolbackend.core.school.School;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED) // This creates separate tables for Student, Teacher, etc.
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@SuperBuilder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    private String firstName;

    private String lastName;

    @Builder.Default
    @Column(nullable = false)
    private boolean enabled = true;

    @Column(nullable = false, unique = true)
    private String username;

    @Builder.Default
    @Column(nullable = false)
    private boolean mustChangePassword = true;

    @Builder.Default
    @Column(nullable = false)
    private int failedLoginAttempts = 0;

    @Builder.Default
    @Column(nullable = false)
    private boolean accountLocked = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id")
    private School school;
}

