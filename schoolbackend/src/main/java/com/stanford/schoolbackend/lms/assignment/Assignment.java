package com.stanford.schoolbackend.lms.assignment;

import com.stanford.schoolbackend.lms.course.Course;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "assignments")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Instant dueDate;

    @Builder.Default
    private Integer maxScore = 100;

    @Builder.Default
    private Instant createdAt = Instant.now();
}