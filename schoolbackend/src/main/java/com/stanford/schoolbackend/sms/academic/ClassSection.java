package com.stanford.schoolbackend.sms.academic;

import com.stanford.schoolbackend.sms.teacher.Teacher;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "class_sections")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class ClassSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g. "10B", "Section A"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grade_level_id", nullable = false)
    private GradeLevel gradeLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "homeroom_teacher_id")
    private Teacher homeroomTeacher;

    private Integer capacity; // max students

    private String roomNumber;

    private String academicYear; // e.g. "2026"

    @Column(columnDefinition = "TEXT")
    private String description;
}