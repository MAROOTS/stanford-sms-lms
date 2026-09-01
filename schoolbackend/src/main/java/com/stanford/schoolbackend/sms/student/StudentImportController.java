package com.stanford.schoolbackend.sms.student;

import com.stanford.schoolbackend.sms.student.dto.ImportCommitResponse;
import com.stanford.schoolbackend.sms.student.dto.ImportValidationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/students/import")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class StudentImportController {

    private final StudentImportService studentImportService;

    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        byte[] csv = studentImportService.generateTemplate();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=student-import-template.csv")
                .body(csv);
    }

    @PostMapping(value = "/validate", consumes = "multipart/form-data")
    public ResponseEntity<ImportValidationResponse> validate(@RequestParam MultipartFile file) {
        return ResponseEntity.ok(studentImportService.validate(file));
    }

    @PostMapping(value = "/commit", consumes = "multipart/form-data")
    public ResponseEntity<ImportCommitResponse> commit(@RequestParam MultipartFile file) {
        return ResponseEntity.ok(studentImportService.commit(file));
    }
}