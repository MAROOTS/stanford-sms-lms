package com.stanford.schoolbackend.sms.exams;

import com.stanford.schoolbackend.sms.exams.dto.MarkEntryRequest;
import com.stanford.schoolbackend.sms.exams.dto.MarkResponse;
import com.stanford.schoolbackend.sms.exams.dto.MarkSheetRow;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marks")
@RequiredArgsConstructor
public class MarkController {

    private final MarkService markService;

    @GetMapping("/entry-sheet")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<List<MarkSheetRow>> getEntrySheet(
            @RequestParam Long examId,
            @RequestParam Long subjectId,
            @RequestParam Long classSectionId) {
        return ResponseEntity.ok(markService.getEntrySheet(examId, subjectId, classSectionId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<List<MarkResponse>> saveMarks(@Valid @RequestBody MarkEntryRequest request) {
        return ResponseEntity.ok(markService.saveMarks(request));
    }

    @GetMapping("/student/{studentId}/exam/{examId}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN') or (hasRole('STUDENT') and @securityUtils.isSelf(#studentId))")
    public ResponseEntity<List<MarkResponse>> listByStudentAndExam(
            @PathVariable Long studentId, @PathVariable Long examId) {
        return ResponseEntity.ok(markService.listByStudentAndExam(studentId, examId));
    }
}

//TODO Note: listByStudentAndExam doesn't currently check that a STUDENT is only viewing their own marks — worth adding the same SecurityUtils ownership check we used for attendance/enrollment if you want students hitting this directly. Flagging it rather than silently adding it, since you may want this locked down differently once the frontend Marks Entry page is built.