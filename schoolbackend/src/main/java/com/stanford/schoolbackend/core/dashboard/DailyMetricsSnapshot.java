package com.stanford.schoolbackend.core.dashboard;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "daily_metrics_snapshots")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class DailyMetricsSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private LocalDate snapshotDate;

    private int totalStudents;
    private int totalTeachers;
    private int activeClasses;
    private Double attendancePercentage; // null if no attendance was recorded that day
}