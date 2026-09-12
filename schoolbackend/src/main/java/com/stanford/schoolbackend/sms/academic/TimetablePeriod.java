package com.stanford.schoolbackend.sms.academic;

import com.stanford.schoolbackend.core.school.School;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Table(name = "timetable_periods",
        uniqueConstraints = @UniqueConstraint(columnNames = {"school_id", "sort_order"}))
@NoArgsConstructor @AllArgsConstructor @Getter @Setter @Builder
public class TimetablePeriod {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int sortOrder;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    @Builder.Default
    private boolean breakPeriod = false;
}