package com.stanford.schoolbackend.lms.assignment;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.lms.assignment.dto.AssignmentRequest;
import com.stanford.schoolbackend.lms.assignment.dto.AssignmentResponse;
import com.stanford.schoolbackend.lms.course.Course;
import com.stanford.schoolbackend.lms.course.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;

    public AssignmentResponse create(Long courseId, AssignmentRequest request) {
        Course course = getOwnedCourseOrThrow(courseId);

        Assignment assignment = Assignment.builder()
                .course(course)
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .maxScore(request.getMaxScore() != null ? request.getMaxScore() : 100)
                .build();

        return toResponse(assignmentRepository.save(assignment));
    }

    public AssignmentResponse update(Long assignmentId, AssignmentRequest request) {
        Assignment assignment = getOwnedAssignmentOrThrow(assignmentId);
        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setDueDate(request.getDueDate());
        if (request.getMaxScore() != null) assignment.setMaxScore(request.getMaxScore());
        return toResponse(assignmentRepository.save(assignment));
    }

    public void delete(Long assignmentId) {
        assignmentRepository.delete(getOwnedAssignmentOrThrow(assignmentId));
    }

    public AssignmentResponse getById(Long assignmentId) {
        return toResponse(assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found")));
    }

    public List<AssignmentResponse> listByCourse(Long courseId) {
        return assignmentRepository.findByCourseId(courseId).stream()
                .map(this::toResponse)
                .toList();
    }

    public Assignment getOwnedAssignmentOrThrow(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        boolean isAdmin = SecurityUtils.currentUserHasRole("ADMIN");
        boolean owns = assignment.getCourse().getTeacher().getEmail().equals(SecurityUtils.currentUserEmail());

        if (!isAdmin && !owns) {
            throw new AccessDeniedException("You do not own this assignment's course");
        }
        return assignment;
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

    private AssignmentResponse toResponse(Assignment a) {
        return AssignmentResponse.builder()
                .id(a.getId())
                .courseId(a.getCourse().getId())
                .courseTitle(a.getCourse().getTitle())
                .title(a.getTitle())
                .description(a.getDescription())
                .dueDate(a.getDueDate())
                .maxScore(a.getMaxScore())
                .createdAt(a.getCreatedAt())
                .build();
    }
}