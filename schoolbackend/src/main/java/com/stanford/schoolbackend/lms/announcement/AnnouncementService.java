package com.stanford.schoolbackend.lms.announcement;

import com.stanford.schoolbackend.core.enums.AnnouncementAudience;
import com.stanford.schoolbackend.core.enums.NotificationType;
import com.stanford.schoolbackend.core.enums.UserRole;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.notification.NotificationService;
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
    private final NotificationService  notificationService;

    public AnnouncementResponse create(AnnouncementRequest request) {
        Teacher teacher = teacherRepository.findByEmail(SecurityUtils.currentUserEmail()).orElse(null);

        Course course = null;
        AnnouncementAudience audience = null;

        if (request.getCourseId() != null) {
            course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

            boolean isAdmin = SecurityUtils.currentUserHasRole("ADMIN");
            boolean owns = course.getTeacher().getEmail().equals(SecurityUtils.currentUserEmail());
            if (!isAdmin && !owns) {
                throw new AccessDeniedException("You do not own this course");
            }
        } else {
            if (!SecurityUtils.currentUserHasRole("ADMIN")) {
                throw new AccessDeniedException("Only admins can post school-wide announcements");
            }
            audience = request.getAudience() != null ? request.getAudience() : AnnouncementAudience.ALL;
        }

        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .course(course)
                .teacher(teacher)
                .audience(audience)
                .build();

        Announcement saved = announcementRepository.save(announcement);

        if (course == null) {
            notifyAudience(audience, request.getTitle());
        }

        return toResponse(saved);
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

    public List<AnnouncementResponse> listSchoolWideForCurrentUser() {
        List<AnnouncementAudience> allowed;
        if (SecurityUtils.currentUserHasRole("TEACHER")) {
            allowed = List.of(AnnouncementAudience.ALL, AnnouncementAudience.TEACHERS);
        } else if (SecurityUtils.currentUserHasRole("STUDENT")) {
            allowed = List.of(AnnouncementAudience.ALL, AnnouncementAudience.STUDENTS);
        } else {
            allowed = List.of(AnnouncementAudience.ALL, AnnouncementAudience.TEACHERS, AnnouncementAudience.STUDENTS);
        }
        return announcementRepository.findByCourseIsNullAndAudienceInOrderByPostedAtDesc(allowed).stream()
                .map(this::toResponse)
                .toList();
    }

    private void notifyAudience(AnnouncementAudience audience, String title) {
        String message = "New announcement: " + title;
        if (audience == AnnouncementAudience.ALL || audience == AnnouncementAudience.TEACHERS) {
            notificationService.notifyRole(UserRole.TEACHER, NotificationType.ANNOUNCEMENT, message, "/announcements");
        }
        if (audience == AnnouncementAudience.ALL || audience == AnnouncementAudience.STUDENTS) {
            notificationService.notifyRole(UserRole.STUDENT, NotificationType.ANNOUNCEMENT, message, "/announcements");
        }
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
                .audience(a.getAudience())

                .build();
    }
}

// teacherRepository.findByEmail(...).orElse(null) instead of .orElseThrow(...),
// and delete()'s ownership check now guards against getTeacher() being null before comparing emails
// (would've thrown a NullPointerException otherwise).