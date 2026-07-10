package com.stanford.schoolbackend.sms.exams;

import com.stanford.schoolbackend.sms.exams.dto.TermRequest;
import com.stanford.schoolbackend.sms.exams.dto.TermResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/terms")
@RequiredArgsConstructor
public class TermController {

    private final TermService termService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TermResponse> create(@Valid @RequestBody TermRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(termService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TermResponse> update(@PathVariable Long id, @Valid @RequestBody TermRequest request) {
        return ResponseEntity.ok(termService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        termService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<TermResponse>> listAll() {
        return ResponseEntity.ok(termService.listAll());
    }
}