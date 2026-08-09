package com.stanford.schoolbackend.sms.admissions;

import com.stanford.schoolbackend.sms.academic.GradeLevel;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "student_applications")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class StudentApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    private LocalDate dateOfBirth;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "desired_grade_level_id")
    private GradeLevel desiredGradeLevel;

    @Column(nullable = false)
    private String guardianName;

    @Column(nullable = false)
    private String guardianEmail;

    @Column(nullable = false)
    private String guardianPhone;

    private String studentEmail; // optional — older students may have their own

    private String previousSchool;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.SUBMITTED;

    @Builder.Default
    private Instant submittedAt = Instant.now();

    private Instant decidedAt;

    private Long enrolledStudentId; // set once converted to a real account
}