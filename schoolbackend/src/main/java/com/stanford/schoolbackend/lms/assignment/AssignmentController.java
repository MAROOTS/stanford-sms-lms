package com.stanford.schoolbackend.lms.assignment;

import com.stanford.schoolbackend.lms.assignment.dto.AssignmentRequest;
import com.stanford.schoolbackend.lms.assignment.dto.AssignmentResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @PostMapping("/api/courses/{courseId}/assignments")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<AssignmentResponse> create(
            @PathVariable Long courseId, @Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assignmentService.create(courseId, request));
    }

    @PutMapping("/api/assignments/{assignmentId}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<AssignmentResponse> update(
            @PathVariable Long assignmentId, @Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.ok(assignmentService.update(assignmentId, request));
    }

    @DeleteMapping("/api/assignments/{assignmentId}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long assignmentId) {
        assignmentService.delete(assignmentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/assignments/{assignmentId}")
    public ResponseEntity<AssignmentResponse> getById(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(assignmentService.getById(assignmentId));
    }

    @GetMapping("/api/courses/{courseId}/assignments")
    public ResponseEntity<List<AssignmentResponse>> listByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(assignmentService.listByCourse(courseId));
    }
}