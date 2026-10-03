package com.stanford.schoolbackend.core.platform;

import com.stanford.schoolbackend.core.platform.dto.PlatformInsightsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/platform/insights")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
public class PlatformInsightsController {

    private final PlatformInsightsService platformInsightsService;

    @GetMapping("/overview")
    public ResponseEntity<PlatformInsightsResponse> overview() {
        return ResponseEntity.ok(platformInsightsService.overview());
    }
}