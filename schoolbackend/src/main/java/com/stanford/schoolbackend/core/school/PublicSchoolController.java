package com.stanford.schoolbackend.core.school;

import com.stanford.schoolbackend.core.school.dto.SchoolProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/schools")
@RequiredArgsConstructor
public class PublicSchoolController {

    private final SchoolProfileService schoolProfileService;

    @GetMapping("/branding")
    public ResponseEntity<SchoolProfileResponse> getBrandingBySubdomain(@RequestParam String subdomain) {
        return ResponseEntity.ok(schoolProfileService.getProfileBySlug(subdomain));
    }
}