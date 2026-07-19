package com.stanford.schoolbackend.lms.course;

import com.stanford.schoolbackend.lms.course.dto.CourseRequest;
import com.stanford.schoolbackend.lms.course.dto.CourseResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<CourseResponse> create(@Valid @RequestBody CourseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.create(request));
    }

    @PutMapping("/{courseId}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<CourseResponse> update(@PathVariable Long courseId, @Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.update(courseId, request));
    }

    @DeleteMapping("/{courseId}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long courseId) {
        courseService.delete(courseId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{courseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CourseResponse> getById(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.getById(courseId));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CourseResponse>> listAll() {
        return ResponseEntity.ok(courseService.listAll());
    }
}