package com.stanford.schoolbackend.lms.enrollment;

import com.stanford.schoolbackend.lms.enrollment.dto.EnrollStudentRequest;
import com.stanford.schoolbackend.lms.enrollment.dto.EnrollmentResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/api/courses/{courseId}/enrollments")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<EnrollmentResponse> enroll(
            @PathVariable Long courseId,
            @Valid @RequestBody EnrollStudentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(enrollmentService.enroll(courseId, request));
    }

    @DeleteMapping("/api/courses/{courseId}/enrollments/{studentId}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<Void> unenroll(@PathVariable Long courseId, @PathVariable Long studentId) {
        enrollmentService.unenroll(courseId, studentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/courses/{courseId}/enrollments")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<List<EnrollmentResponse>> listByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.listByCourse(courseId));
    }

    @GetMapping("/api/students/{studentId}/enrollments")
    @PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
    public ResponseEntity<List<EnrollmentResponse>> listByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.listByStudent(studentId));
    }

    @PostMapping("/api/courses/{courseId}/enroll")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<EnrollmentResponse> selfEnroll(@PathVariable Long courseId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(enrollmentService.selfEnroll(courseId));
    }

    @DeleteMapping("/api/courses/{courseId}/enroll")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> selfDrop(@PathVariable Long courseId) {
        enrollmentService.selfDrop(courseId);
        return ResponseEntity.noContent().build();
    }
}