package com.stanford.schoolbackend.core.school;

import com.stanford.schoolbackend.core.enums.SchoolStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "schools")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class School {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SchoolStatus status = SchoolStatus.ACTIVE;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(nullable = false, unique = true)
    private String slug;
}