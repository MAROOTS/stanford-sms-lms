package com.stanford.schoolbackend.lms.announcement.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class AnnouncementResponse {
    private Long id;
    private String title;
    private String content;
    private Long courseId;
    private String courseTitle; // null if school-wide
    private String teacherName;
    private Instant postedAt;
}