package com.stanford.schoolbackend.lms.enrollment;

import com.stanford.schoolbackend.core.enums.EnrollmentStatus;
import com.stanford.schoolbackend.core.exception.DuplicateEnrollmentException;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.lms.course.Course;
import com.stanford.schoolbackend.lms.course.CourseRepository;
import com.stanford.schoolbackend.lms.enrollment.dto.EnrollStudentRequest;
import com.stanford.schoolbackend.lms.enrollment.dto.EnrollmentResponse;
import com.stanford.schoolbackend.sms.student.Student;
import com.stanford.schoolbackend.sms.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;

    public EnrollmentResponse enroll(Long courseId, EnrollStudentRequest request) {
        Course course = getOwnedCourseOrThrow(courseId);

        if (enrollmentRepository.existsByStudentIdAndCourseId(request.getStudentId(), courseId)) {
            throw new DuplicateEnrollmentException("Student is already enrolled in this course");
        }

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .build();

        return toResponse(enrollmentRepository.save(enrollment));
    }

    public void unenroll(Long courseId, Long studentId) {
        getOwnedCourseOrThrow(courseId);

        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));

        enrollment.setStatus(EnrollmentStatus.DROPPED);
        enrollmentRepository.save(enrollment);
    }

    public EnrollmentResponse selfEnroll(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        Student student = studentRepository.findByEmail(SecurityUtils.currentUserEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new DuplicateEnrollmentException("You are already enrolled in this course");
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .build();

        return toResponse(enrollmentRepository.save(enrollment));
    }

    public void selfDrop(Long courseId) {
        Student student = studentRepository.findByEmail(SecurityUtils.currentUserEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(student.getId(), courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));

        enrollment.setStatus(EnrollmentStatus.DROPPED);
        enrollmentRepository.save(enrollment);
    }

    public List<EnrollmentResponse> listByCourse(Long courseId) {
        getOwnedCourseOrThrow(courseId);
        return enrollmentRepository.findByCourseId(courseId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<EnrollmentResponse> listByStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        boolean isPrivileged = SecurityUtils.currentUserHasRole("TEACHER")
                || SecurityUtils.currentUserHasRole("ADMIN");

        if (!isPrivileged && !student.getEmail().equals(SecurityUtils.currentUserEmail())) {
            throw new AccessDeniedException("You can only view your own enrollments");
        }

        return enrollmentRepository.findByStudentId(studentId).stream()
                .map(this::toResponse)
                .toList();
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

    private EnrollmentResponse toResponse(Enrollment enrollment) {
        return EnrollmentResponse.builder()
                .id(enrollment.getId())
                .studentId(enrollment.getStudent().getId())
                .studentName(enrollment.getStudent().getFirstName() + " " + enrollment.getStudent().getLastName())
                .courseId(enrollment.getCourse().getId())
                .courseTitle(enrollment.getCourse().getTitle())
                .status(enrollment.getStatus())
                .enrolledAt(enrollment.getEnrolledAt())
                .build();
    }
}

//Ownership rule: a TEACHER can only manage enrollments for courses they own;
// ADMIN can manage any course;
// a STUDENT can only view their own enrollment list.
