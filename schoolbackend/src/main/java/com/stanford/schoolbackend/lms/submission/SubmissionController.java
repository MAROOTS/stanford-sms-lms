package com.stanford.schoolbackend.lms.submission;

import com.stanford.schoolbackend.lms.submission.dto.GradeRequest;
import com.stanford.schoolbackend.lms.submission.dto.SubmissionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping(value = "/api/assignments/{assignmentId}/submissions", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SubmissionResponse> submit(
            @PathVariable Long assignmentId,
            @RequestParam(required = false) String textContent,
            @RequestParam(required = false) MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(submissionService.submit(assignmentId, textContent, file));
    }

    @PutMapping("/api/submissions/{submissionId}/grade")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<SubmissionResponse> grade(
            @PathVariable Long submissionId, @Valid @RequestBody GradeRequest request) {
        return ResponseEntity.ok(submissionService.grade(submissionId, request));
    }

    @GetMapping("/api/assignments/{assignmentId}/submissions")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<List<SubmissionResponse>> listByAssignment(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(submissionService.listByAssignment(assignmentId));
    }

    @GetMapping("/api/assignments/{assignmentId}/submissions/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SubmissionResponse> getMySubmission(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(submissionService.getMySubmission(assignmentId));
    }
}