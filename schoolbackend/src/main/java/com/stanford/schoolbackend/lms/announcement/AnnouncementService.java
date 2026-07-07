package com.stanford.schoolbackend.lms.announcement;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.lms.announcement.dto.AnnouncementRequest;
import com.stanford.schoolbackend.lms.announcement.dto.AnnouncementResponse;
import com.stanford.schoolbackend.lms.course.Course;
import com.stanford.schoolbackend.lms.course.CourseRepository;
import com.stanford.schoolbackend.sms.teacher.Teacher;
import com.stanford.schoolbackend.sms.teacher.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;

    public AnnouncementResponse create(AnnouncementRequest request) {
        // look up a teacher profile if one exists — admins often won't have one
        Teacher teacher = teacherRepository.findByEmail(SecurityUtils.currentUserEmail()).orElse(null);

        Course course = null;
        if (request.getCourseId() != null) {
            course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

            boolean isAdmin = SecurityUtils.currentUserHasRole("ADMIN");
            boolean owns = course.getTeacher().getEmail().equals(SecurityUtils.currentUserEmail());
            if (!isAdmin && !owns) {
                throw new AccessDeniedException("You do not own this course");
            }
        } else {
            // school-wide announcement — admin only
            if (!SecurityUtils.currentUserHasRole("ADMIN")) {
                throw new AccessDeniedException("Only admins can post school-wide announcements");
            }
        }

        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .course(course)
                .teacher(teacher)
                .build();

        return toResponse(announcementRepository.save(announcement));
    }

    public void delete(Long announcementId) {
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found"));

        boolean isAdmin = SecurityUtils.currentUserHasRole("ADMIN");
        boolean owns = announcement.getTeacher() != null
                && announcement.getTeacher().getEmail().equals(SecurityUtils.currentUserEmail());

        if (!isAdmin && !owns) {
            throw new AccessDeniedException("You do not own this announcement");
        }

        announcementRepository.delete(announcement);
    }

    public List<AnnouncementResponse> listByCourse(Long courseId) {
        return announcementRepository.findByCourseId(courseId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<AnnouncementResponse> listSchoolWide() {
        return announcementRepository.findByCourseIsNull().stream()
                .map(this::toResponse)
                .toList();
    }

    private AnnouncementResponse toResponse(Announcement a) {
        return AnnouncementResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .content(a.getContent())
                .courseId(a.getCourse() != null ? a.getCourse().getId() : null)
                .courseTitle(a.getCourse() != null ? a.getCourse().getTitle() : null)
                .teacherName(a.getTeacher() != null
                        ? a.getTeacher().getFirstName() + " " + a.getTeacher().getLastName()
                        : "School Administration")
                .postedAt(a.getPostedAt())
                .build();
    }
}

// teacherRepository.findByEmail(...).orElse(null) instead of .orElseThrow(...),
// and delete()'s ownership check now guards against getTeacher() being null before comparing emails
// (would've thrown a NullPointerException otherwise).