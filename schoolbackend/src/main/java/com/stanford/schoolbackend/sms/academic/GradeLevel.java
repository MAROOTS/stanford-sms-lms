package com.stanford.schoolbackend.sms.academic;

import com.stanford.schoolbackend.core.school.School;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "grade_levels")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class GradeLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Column(nullable = false, unique = true)
    private String name; // e.g. "Grade 10", "Freshman Year", "Form 3"

    @Column(nullable = false)
    private Integer sortOrder; // for displaying levels in the right sequence

    @Column
    private String stage;
}