package com.stanford.schoolbackend.sms.attendance;

import com.stanford.schoolbackend.lms.course.Course;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "sessions")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private LocalDate sessionDate;

    private String topic;
}