package com.stanford.schoolbackend.lms.announcement;

import com.stanford.schoolbackend.core.enums.AnnouncementAudience;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByCourseId(Long courseId);
    List<Announcement> findByCourseIsNull(); // school-wide
    List<Announcement> findByCourseIsNullAndAudienceInOrderByPostedAtDesc(List<AnnouncementAudience> audiences);
}