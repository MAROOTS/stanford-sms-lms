package com.stanford.schoolbackend.sms.attendance;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.lms.course.Course;
import com.stanford.schoolbackend.lms.course.CourseRepository;
import com.stanford.schoolbackend.sms.attendance.dto.SessionRequest;
import com.stanford.schoolbackend.sms.attendance.dto.SessionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final CourseRepository courseRepository;

    public SessionResponse create(Long courseId, SessionRequest request) {
        Course course = getOwnedCourseOrThrow(courseId);

        Session session = Session.builder()
                .course(course)
                .sessionDate(request.getSessionDate())
                .topic(request.getTopic())
                .build();

        return toResponse(sessionRepository.save(session));
    }

    public List<SessionResponse> listByCourse(Long courseId) {
        return sessionRepository.findByCourseId(courseId).stream()
                .map(this::toResponse)
                .toList();
    }

    public Session getOwnedSessionOrThrow(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        boolean isAdmin = SecurityUtils.currentUserHasRole("ADMIN");
        boolean owns = session.getCourse().getTeacher().getEmail().equals(SecurityUtils.currentUserEmail());

        if (!isAdmin && !owns) {
            throw new AccessDeniedException("You do not own this session's course");
        }
        return session;
    }

    private Course getOwnedCourseOrThrow(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        boolean isAdmin = SecurityUtils.currentUserHasRole("ADMIN");
        boolean owns = course.getTeacher().getEmail().equals(SecurityUtils.currentUserEmail());

        if (!isAdmin && !owns) {
            throw new AccessDeniedException("You do not own this course");
        }
        return course;
    }

    private SessionResponse toResponse(Session s) {
        return SessionResponse.builder()
                .id(s.getId())
                .courseId(s.getCourse().getId())
                .courseTitle(s.getCourse().getTitle())
                .sessionDate(s.getSessionDate())
                .topic(s.getTopic())
                .build();
    }
}