package com.stanford.schoolbackend.sms.exams;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "terms")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Term {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g. "Term 2 2026"

    private LocalDate startDate;
    private LocalDate endDate;

    @Builder.Default
    private boolean isCurrent = false;

    @Builder.Default
    private boolean endingSoonNotified = false;
}