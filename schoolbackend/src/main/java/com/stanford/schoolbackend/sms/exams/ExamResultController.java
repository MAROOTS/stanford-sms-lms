package com.stanford.schoolbackend.sms.exams;

import com.stanford.schoolbackend.sms.exams.dto.ClassExamResultRow;
import com.stanford.schoolbackend.sms.exams.dto.StudentExamResultResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class ExamResultController {

    private final ExamResultService examResultService;

    @GetMapping("/exam/{examId}/class/{classSectionId}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<List<ClassExamResultRow>> getClassResults(
            @PathVariable Long examId, @PathVariable Long classSectionId) {
        return ResponseEntity.ok(examResultService.getClassResults(examId, classSectionId));
    }

    @GetMapping("/student/{studentId}/exam/{examId}")
    @PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
    public ResponseEntity<StudentExamResultResponse> getStudentResult(
            @PathVariable Long studentId, @PathVariable Long examId) {
        return ResponseEntity.ok(examResultService.getStudentResult(studentId, examId));
    }
}