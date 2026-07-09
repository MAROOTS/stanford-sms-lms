package com.stanford.schoolbackend.sms.academic;

import com.stanford.schoolbackend.sms.academic.dto.ClassSectionRequest;
import com.stanford.schoolbackend.sms.academic.dto.ClassSectionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/class-sections")
@RequiredArgsConstructor
public class ClassSectionController {

    private final ClassSectionService classSectionService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClassSectionResponse> create(@Valid @RequestBody ClassSectionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(classSectionService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<ClassSectionResponse>> listAll() {
        return ResponseEntity.ok(classSectionService.listAll());
    }

    @GetMapping("/by-grade-level/{gradeLevelId}")
    public ResponseEntity<List<ClassSectionResponse>> listByGradeLevel(@PathVariable Long gradeLevelId) {
        return ResponseEntity.ok(classSectionService.listByGradeLevel(gradeLevelId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClassSectionResponse> update(@PathVariable Long id, @Valid @RequestBody ClassSectionRequest request) {
        return ResponseEntity.ok(classSectionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        classSectionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}