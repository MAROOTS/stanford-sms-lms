package com.stanford.schoolbackend.core.school;

import com.stanford.schoolbackend.core.school.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/platform/schools")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
public class PlatformAdminController {

    private final PlatformAdminService platformAdminService;

    @PostMapping
    public ResponseEntity<OnboardSchoolResponse> onboardSchool(@Valid @RequestBody OnboardSchoolRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(platformAdminService.onboardSchool(request));
    }

    @GetMapping
    public ResponseEntity<List<SchoolResponse>> listSchools() {
        return ResponseEntity.ok(platformAdminService.listSchools());
    }

    @PatchMapping("/{schoolId}/status")
    public ResponseEntity<SchoolResponse> updateStatus(@PathVariable Long schoolId, @Valid @RequestBody UpdateSchoolStatusRequest request) {
        return ResponseEntity.ok(platformAdminService.updateStatus(schoolId, request));
    }
}