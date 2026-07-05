package com.stanford.schoolbackend.sms.student;

import com.stanford.schoolbackend.sms.academic.dto.AssignSectionRequest;
import com.stanford.schoolbackend.sms.student.dto.StudentResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @PatchMapping("/{studentId}/section")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> assignSection(@PathVariable Long studentId, @Valid @RequestBody AssignSectionRequest request) {
        studentService.assignSection(studentId, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{studentId}")
    public ResponseEntity<StudentResponse> getById(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentService.getById(studentId));
    }
}