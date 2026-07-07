package com.stanford.schoolbackend.lms.announcement;

import com.stanford.schoolbackend.lms.course.Course;
import com.stanford.schoolbackend.sms.teacher.Teacher;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "announcements")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id") // nullable: null = school-wide announcement
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Builder.Default
    private Instant postedAt = Instant.now();
}