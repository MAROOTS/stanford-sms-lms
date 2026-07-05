package com.stanford.schoolbackend.lms.submission;

import com.stanford.schoolbackend.lms.assignment.Assignment;
import com.stanford.schoolbackend.sms.student.Student;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "submissions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"assignment_id", "student_id"}))
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(columnDefinition = "TEXT")
    private String textContent;

    private String fileUrl; // set once file storage (local disk / S3) is wired up

    @Builder.Default
    private Instant submittedAt = Instant.now();

    private Integer grade;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    private Instant gradedAt;
}
