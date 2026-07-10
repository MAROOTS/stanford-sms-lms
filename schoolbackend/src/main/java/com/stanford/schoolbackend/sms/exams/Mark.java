package com.stanford.schoolbackend.sms.exams;

import com.stanford.schoolbackend.sms.academic.Subject;
import com.stanford.schoolbackend.sms.student.Student;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "marks",
        uniqueConstraints = @UniqueConstraint(columnNames = {"exam_id", "subject_id", "student_id"}))
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Mark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private Double score;

    @Builder.Default
    private Double maxScore = 100.0;
}