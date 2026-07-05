package com.stanford.schoolbackend.lms.course;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.lms.course.dto.CourseRequest;
import com.stanford.schoolbackend.lms.course.dto.CourseResponse;
import com.stanford.schoolbackend.sms.teacher.Teacher;
import com.stanford.schoolbackend.sms.teacher.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;

    public CourseResponse create(CourseRequest request) {
        Teacher teacher = teacherRepository.findByEmail(SecurityUtils.currentUserEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .teacher(teacher)
                .build();

        return toResponse(courseRepository.save(course));
    }

    public CourseResponse update(Long courseId, CourseRequest request) {
        Course course = getOwnedCourseOrThrow(courseId);
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        return toResponse(courseRepository.save(course));
    }

    public void delete(Long courseId) {
        Course course = getOwnedCourseOrThrow(courseId);
        courseRepository.delete(course);
    }

    public CourseResponse getById(Long courseId) {
        return toResponse(courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found")));
    }

    public List<CourseResponse> listAll() {
        return courseRepository.findAll().stream().map(this::toResponse).toList();
    }

    private Course getOwnedCourseOrThrow(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        boolean isAdmin = SecurityUtils.currentUserHasRole("ADMIN");
        boolean ownsCourse = course.getTeacher().getEmail().equals(SecurityUtils.currentUserEmail());

        if (!isAdmin && !ownsCourse) {
            throw new AccessDeniedException("You do not own this course");
        }
        return course;
    }

    private CourseResponse toResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .teacherId(course.getTeacher().getId())
                .teacherName(course.getTeacher().getFirstName() + " " + course.getTeacher().getLastName())
                .createdAt(course.getCreatedAt())
                .build();
    }
}