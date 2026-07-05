package com.stanford.schoolbackend.sms.attendance;

import com.stanford.schoolbackend.core.enums.AttendanceStatus;
import com.stanford.schoolbackend.sms.student.Student;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "attendance_records",
        uniqueConstraints = @UniqueConstraint(columnNames = {"session_id", "student_id"}))
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;
}