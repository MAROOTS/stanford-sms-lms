package com.stanford.schoolbackend.sms.academic;

import com.stanford.schoolbackend.sms.academic.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;

    @GetMapping("/periods")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public List<TimetablePeriodResponse> periods() {
        return timetableService.listPeriods();
    }

    @PostMapping("/periods")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TimetablePeriodResponse> createPeriod(
            @Valid @RequestBody TimetablePeriodRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(timetableService.createPeriod(request));
    }

    @PostMapping("/periods/defaults")
    @PreAuthorize("hasRole('ADMIN')")
    public List<TimetablePeriodResponse> seedDefaults() {
        return timetableService.seedDefaults();
    }

    @DeleteMapping("/periods/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePeriod(@PathVariable Long id) {
        timetableService.deletePeriod(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/classes/{classSectionId}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ClassTimetableResponse classGrid(@PathVariable Long classSectionId) {
        return timetableService.getClassTimetable(classSectionId);
    }

    @PutMapping("/classes/{classSectionId}/slots")
    @PreAuthorize("hasRole('ADMIN')")
    public TimetableSlotResponse putSlot(
            @PathVariable Long classSectionId,
            @Valid @RequestBody PutTimetableSlotRequest request) {
        return timetableService.putSlot(classSectionId, request);
    }
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('STUDENT','TEACHER')")
    public ClassTimetableResponse mine() {
        return timetableService.getMine();
    }
}
