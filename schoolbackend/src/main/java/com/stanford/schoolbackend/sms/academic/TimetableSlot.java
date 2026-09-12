package com.stanford.schoolbackend.sms.academic;

import com.stanford.schoolbackend.core.school.School;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "timetable_slots",
        uniqueConstraints = @UniqueConstraint(columnNames = {"class_section_id", "period_id", "day_of_week"}))
@NoArgsConstructor @AllArgsConstructor @Getter @Setter @Builder
public class TimetableSlot {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_section_id", nullable = false)
    private ClassSection classSection;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "period_id", nullable = false)
    private TimetablePeriod period;
    /** 1 = Monday … 5 = Friday */
    @Column(nullable = false)
    private int dayOfWeek;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teaching_assignment_id")
    private TeachingAssignment teachingAssignment;

    private String room;
}