package com.stanford.schoolbackend.sms.exams;

import com.stanford.schoolbackend.sms.exams.dto.ExamRequest;
import com.stanford.schoolbackend.sms.exams.dto.ExamResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamResponse> create(@Valid @RequestBody ExamRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(examService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamResponse> update(@PathVariable Long id, @Valid @RequestBody ExamRequest request) {
        return ResponseEntity.ok(examService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        examService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<List<ExamResponse>> listAll() {
        return ResponseEntity.ok(examService.listAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<ExamResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getById(id));
    }
}

//The entry screen needs a "sheet" endpoint that returns every student in a class section, with their existing mark if one exists (or blank if not) — so the teacher sees a pre-filled form, not an empty one every time

//TODO Known simplification: there's no "which teacher teaches which subject to which class" assignment yet, so for now any TEACHER/ADMIN can enter marks for any exam/subject/class combo. Worth revisiting later if I want per-subject teacher ownership — similar pattern to how Course ownership works in the LMS side.