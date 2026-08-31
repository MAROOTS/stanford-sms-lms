package com.stanford.schoolbackend.sms.academic;

import com.stanford.schoolbackend.core.school.School;
import com.stanford.schoolbackend.sms.teacher.Teacher;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "teaching_assignments",
        uniqueConstraints = @UniqueConstraint(columnNames = {"class_section_id", "subject_id"})
)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class TeachingAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_section_id", nullable = false)
    private ClassSection classSection;
}