package com.stanford.schoolbackend.sms.exams;

import com.stanford.schoolbackend.sms.academic.ClassSection;
import com.stanford.schoolbackend.sms.academic.Subject;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "exams")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String examType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "term_id", nullable = false)
    private Term term;

    @ManyToMany
    @JoinTable(
            name = "exam_class_sections",
            joinColumns = @JoinColumn(name = "exam_id"),
            inverseJoinColumns = @JoinColumn(name = "class_section_id")
    )
    @Builder.Default
    private Set<ClassSection> classSections = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "exam_subjects",
            joinColumns = @JoinColumn(name = "exam_id"),
            inverseJoinColumns = @JoinColumn(name = "subject_id")
    )
    @Builder.Default
    private Set<Subject> subjects = new HashSet<>();

    // ── Schedule & Scoring ──
    private LocalDate startDate;
    private LocalDate endDate;
    private Double maxScore;
    private Double weight;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String status; // DRAFT, PUBLISHED, COMPLETED, ARCHIVED
}
