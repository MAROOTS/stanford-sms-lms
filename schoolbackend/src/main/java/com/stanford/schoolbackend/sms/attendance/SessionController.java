package com.stanford.schoolbackend.sms.attendance;

import com.stanford.schoolbackend.sms.attendance.dto.SessionRequest;
import com.stanford.schoolbackend.sms.attendance.dto.SessionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping("/api/courses/{courseId}/sessions")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<SessionResponse> create(
            @PathVariable Long courseId, @Valid @RequestBody SessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionService.create(courseId, request));
    }

    @GetMapping("/api/courses/{courseId}/sessions")
    public ResponseEntity<List<SessionResponse>> listByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(sessionService.listByCourse(courseId));
    }
}