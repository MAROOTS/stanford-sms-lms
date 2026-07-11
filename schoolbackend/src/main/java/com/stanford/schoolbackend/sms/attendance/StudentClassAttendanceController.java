package com.stanford.schoolbackend.sms.attendance;

import com.stanford.schoolbackend.sms.attendance.dto.ClassAttendanceRecordResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentClassAttendanceController {

    private final ClassAttendanceService classAttendanceService;

    @GetMapping("/{studentId}/class-attendance")
    @PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
    public ResponseEntity<List<ClassAttendanceRecordResponse>> listByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(classAttendanceService.listByStudent(studentId));
    }
}