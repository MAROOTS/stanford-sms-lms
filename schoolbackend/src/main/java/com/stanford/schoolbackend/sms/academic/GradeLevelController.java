package com.stanford.schoolbackend.sms.academic;

import com.stanford.schoolbackend.sms.academic.dto.GradeLevelRequest;
import com.stanford.schoolbackend.sms.academic.dto.GradeLevelResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grade-levels")
@RequiredArgsConstructor
public class GradeLevelController {

    private final GradeLevelService gradeLevelService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GradeLevelResponse> create(@Valid @RequestBody GradeLevelRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gradeLevelService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GradeLevelResponse> update(@PathVariable Long id, @Valid @RequestBody GradeLevelRequest request) {
        return ResponseEntity.ok(gradeLevelService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        gradeLevelService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<GradeLevelResponse>> listAll() {
        return ResponseEntity.ok(gradeLevelService.listAll());
    }
}