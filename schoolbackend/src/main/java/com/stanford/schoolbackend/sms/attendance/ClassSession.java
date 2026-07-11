package com.stanford.schoolbackend.sms.attendance;

import com.stanford.schoolbackend.sms.academic.ClassSection;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "class_sessions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"class_section_id", "session_date"}))
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class ClassSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_section_id", nullable = false)
    private ClassSection classSection;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    private String note; // optional, e.g. "Half day — sports event"
}