package com.stanford.schoolbackend.lms.announcement.dto;

import com.stanford.schoolbackend.core.enums.AnnouncementAudience;
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
    private AnnouncementAudience audience;
}