package com.stanford.schoolbackend.lms.submission;

import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.core.storage.FileStorageService;
import com.stanford.schoolbackend.lms.assignment.Assignment;
import com.stanford.schoolbackend.lms.assignment.AssignmentRepository;
import com.stanford.schoolbackend.lms.assignment.AssignmentService;
import com.stanford.schoolbackend.lms.enrollment.EnrollmentRepository;
import com.stanford.schoolbackend.lms.submission.dto.GradeRequest;
import com.stanford.schoolbackend.lms.submission.dto.SubmissionResponse;
import com.stanford.schoolbackend.sms.student.Student;
import com.stanford.schoolbackend.sms.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentService assignmentService;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final FileStorageService fileStorageService;

    public SubmissionResponse submit(Long assignmentId, String textContent, MultipartFile file) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        Student student = studentRepository.findByEmail(SecurityUtils.currentUserEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        boolean enrolled = enrollmentRepository
                .existsByStudentIdAndCourseId(student.getId(), assignment.getCourse().getId());
        if (!enrolled) {
            throw new AccessDeniedException("You must be enrolled in this course to submit");
        }

        Submission submission = submissionRepository
                .findByAssignmentIdAndStudentId(assignmentId, student.getId())
                .orElse(Submission.builder().assignment(assignment).student(student).build());

        submission.setTextContent(textContent);
        if (file != null && !file.isEmpty()) {
            submission.setFileUrl(fileStorageService.store(file));
        }
        submission.setSubmittedAt(Instant.now());

        return toResponse(submissionRepository.save(submission));
    }

    public SubmissionResponse grade(Long submissionId, GradeRequest request) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        // reuses the same ownership check as AssignmentService — confirms the
        // current teacher owns the course this submission's assignment belongs to
        assignmentService.getOwnedAssignmentOrThrow(submission.getAssignment().getId());

        submission.setGrade(request.getGrade());
        submission.setFeedback(request.getFeedback());
        submission.setGradedAt(Instant.now());

        return toResponse(submissionRepository.save(submission));
    }

    public List<SubmissionResponse> listByAssignment(Long assignmentId) {
        assignmentService.getOwnedAssignmentOrThrow(assignmentId);
        return submissionRepository.findByAssignmentId(assignmentId).stream()
                .map(this::toResponse)
                .toList();
    }

    public SubmissionResponse getMySubmission(Long assignmentId) {
        Student student = studentRepository.findByEmail(SecurityUtils.currentUserEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        return submissionRepository.findByAssignmentIdAndStudentId(assignmentId, student.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("You have not submitted this assignment"));
    }

    private SubmissionResponse toResponse(Submission s) {
        return SubmissionResponse.builder()
                .id(s.getId())
                .assignmentId(s.getAssignment().getId())
                .studentId(s.getStudent().getId())
                .studentName(s.getStudent().getFirstName() + " " + s.getStudent().getLastName())
                .textContent(s.getTextContent())
                .fileUrl(s.getFileUrl())
                .submittedAt(s.getSubmittedAt())
                .grade(s.getGrade())
                .feedback(s.getFeedback())
                .gradedAt(s.getGradedAt())
                .build();
    }
}
//submit() upserts — calling it again before the due date overwrites the previous attempt rather than creating a duplicate row,
// which matches the unique constraint on (assignment_id, student_id).