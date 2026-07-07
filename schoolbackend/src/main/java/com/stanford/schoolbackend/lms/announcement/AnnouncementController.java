package com.stanford.schoolbackend.lms.announcement;

import com.stanford.schoolbackend.lms.announcement.dto.AnnouncementRequest;
import com.stanford.schoolbackend.lms.announcement.dto.AnnouncementResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<AnnouncementResponse> create(@Valid @RequestBody AnnouncementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(announcementService.create(request));
    }

    @DeleteMapping("/{announcementId}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long announcementId) {
        announcementService.delete(announcementId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AnnouncementResponse>> listByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(announcementService.listByCourse(courseId));
    }

    @GetMapping("/school-wide")
    public ResponseEntity<List<AnnouncementResponse>> listSchoolWide() {
        return ResponseEntity.ok(announcementService.listSchoolWide());
    }
}