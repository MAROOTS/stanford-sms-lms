package com.stanford.schoolbackend.core.admin.upload;

import com.stanford.schoolbackend.core.admin.upload.dto.UploadResult;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String entityType) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Please select a file to upload"));
        }

        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "File size exceeds the 10MB limit"));
        }

        try {
            UploadResult result = uploadService.processFile(file, entityType);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to process file: " + e.getMessage()));
        }
    }

    @GetMapping("/template/{type}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> downloadTemplate(@PathVariable String type) {
        // Could generate and return a sample CSV template
        return ResponseEntity.ok(Map.of("message", "Template endpoint ready"));
    }
}
