package com.stanford.schoolbackend.sms.attendance;

import com.stanford.schoolbackend.sms.attendance.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/class-sections/{classSectionId}/attendance")
@RequiredArgsConstructor
public class ClassAttendanceController {

    private final ClassAttendanceService classAttendanceService;

    @GetMapping("/entry-sheet")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<List<ClassAttendanceSheetRow>> getEntrySheet(
            @PathVariable Long classSectionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(classAttendanceService.getEntrySheet(classSectionId, date));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<List<ClassAttendanceRecordResponse>> markAttendance(
            @PathVariable Long classSectionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody MarkClassAttendanceRequest request) {
        return ResponseEntity.ok(classAttendanceService.markAttendance(classSectionId, date, request));
    }

    @GetMapping("/sessions")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<List<ClassSessionResponse>> listSessions(@PathVariable Long classSectionId) {
        return ResponseEntity.ok(classAttendanceService.listSessions(classSectionId));
    }
}