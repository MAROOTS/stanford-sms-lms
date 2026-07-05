package com.stanford.schoolbackend.sms.attendance;

import com.stanford.schoolbackend.sms.attendance.dto.AttendanceRecordResponse;
import com.stanford.schoolbackend.sms.attendance.dto.MarkAttendanceRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/api/sessions/{sessionId}/attendance")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<List<AttendanceRecordResponse>> markAttendance(
            @PathVariable Long sessionId, @Valid @RequestBody MarkAttendanceRequest request) {
        return ResponseEntity.ok(attendanceService.markAttendance(sessionId, request));
    }

    @GetMapping("/api/sessions/{sessionId}/attendance")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<List<AttendanceRecordResponse>> listBySession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(attendanceService.listBySession(sessionId));
    }

    @GetMapping("/api/students/{studentId}/attendance")
    @PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
    public ResponseEntity<List<AttendanceRecordResponse>> listByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.listByStudent(studentId));
    }
}