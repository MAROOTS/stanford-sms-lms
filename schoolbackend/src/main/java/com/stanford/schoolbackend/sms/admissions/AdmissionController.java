package com.stanford.schoolbackend.sms.admissions;

import com.stanford.schoolbackend.sms.admissions.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admissions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdmissionController {

    private final AdmissionService admissionService;

    @PostMapping
    public ResponseEntity<StudentApplicationResponse> create(@Valid @RequestBody CreateApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(admissionService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentApplicationResponse> update(@PathVariable Long id, @Valid @RequestBody CreateApplicationRequest request) {
        return ResponseEntity.ok(admissionService.update(id, request));
    }

    @GetMapping
    public ResponseEntity<List<StudentApplicationResponse>> listAll(@RequestParam(required = false) ApplicationStatus status) {
        return ResponseEntity.ok(admissionService.listAll(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentApplicationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(admissionService.getById(id));
    }

    @PatchMapping("/{id}/decision")
    public ResponseEntity<StudentApplicationResponse> decide(@PathVariable Long id, @Valid @RequestBody DecisionRequest request) {
        return ResponseEntity.ok(admissionService.decide(id, request));
    }

    @PostMapping("/{id}/enroll")
    public ResponseEntity<EnrollApplicationResponse> enroll(@PathVariable Long id, @Valid @RequestBody EnrollApplicationRequest request) {
        return ResponseEntity.ok(admissionService.enroll(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        admissionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}