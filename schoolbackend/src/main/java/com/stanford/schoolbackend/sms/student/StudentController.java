package com.stanford.schoolbackend.sms.student;

import com.stanford.schoolbackend.sms.academic.dto.AssignSectionRequest;
import com.stanford.schoolbackend.sms.student.dto.StudentResponse;
import com.stanford.schoolbackend.sms.student.dto.StudentUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    @PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
    public ResponseEntity<StudentResponse> getById(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentService.getById(studentId));
    }
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<List<StudentResponse>> listAll() {
        return ResponseEntity.ok(studentService.listAll());
    }

    @PutMapping("/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentResponse> update(@PathVariable Long studentId, @Valid @RequestBody StudentUpdateRequest request) {
        return ResponseEntity.ok(studentService.update(studentId, request));
    }

    @DeleteMapping("/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long studentId) {
        studentService.delete(studentId);
        return ResponseEntity.noContent().build();
    }
}