package com.stanford.schoolbackend.sms.teacher;

import com.stanford.schoolbackend.sms.teacher.dto.TeacherResponse;
import com.stanford.schoolbackend.sms.teacher.dto.TeacherUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<List<TeacherResponse>> listAll() {
        return ResponseEntity.ok(teacherService.listAll());
    }

    @PutMapping("/{teacherId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TeacherResponse> update(@PathVariable Long teacherId, @Valid @RequestBody TeacherUpdateRequest request) {
        return ResponseEntity.ok(teacherService.update(teacherId, request));
    }

    @DeleteMapping("/{teacherId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long teacherId) {
        teacherService.delete(teacherId);
        return ResponseEntity.noContent().build();
    }
}