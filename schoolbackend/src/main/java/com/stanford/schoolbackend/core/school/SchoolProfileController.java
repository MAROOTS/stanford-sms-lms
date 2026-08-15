package com.stanford.schoolbackend.core.school;

import com.stanford.schoolbackend.core.school.dto.SchoolProfileResponse;
import com.stanford.schoolbackend.core.school.dto.UpdateSchoolProfileRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/school-profile")
@RequiredArgsConstructor
public class SchoolProfileController {

    private final SchoolProfileService schoolProfileService;

    @GetMapping
    public ResponseEntity<SchoolProfileResponse> getProfile() {
        return ResponseEntity.ok(schoolProfileService.getProfile());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SchoolProfileResponse> update(@Valid @RequestBody UpdateSchoolProfileRequest request) {
        return ResponseEntity.ok(schoolProfileService.update(request));
    }

    @PostMapping(value = "/logo", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SchoolProfileResponse> updateLogo(@RequestParam MultipartFile file) {
        return ResponseEntity.ok(schoolProfileService.updateLogo(file));
    }
}