package com.stanford.schoolbackend.sms.parent;

import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.core.user.UserRepository;
import com.stanford.schoolbackend.sms.parent.dto.ParentRequest;
import com.stanford.schoolbackend.sms.parent.dto.ParentResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parents")
@RequiredArgsConstructor
public class ParentController {

    private final ParentService parentService;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ParentResponse>> getAllParents() {
        return ResponseEntity.ok(parentService.getAllParents());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('PARENT') and #id == authentication.principal)")
    public ResponseEntity<ParentResponse> getParentById(@PathVariable Long id) {
        return ResponseEntity.ok(parentService.getParentById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParentResponse> createParent(@Valid @RequestBody ParentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(parentService.createParent(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParentResponse> updateParent(@PathVariable Long id, @Valid @RequestBody ParentRequest request) {
        return ResponseEntity.ok(parentService.updateParent(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteParent(@PathVariable Long id) {
        parentService.deleteParent(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/link")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParentResponse> linkChild(@RequestBody Map<String, Object> body) {
        Long parentId = Long.valueOf(body.get("parentId").toString());
        Long studentId = Long.valueOf(body.get("studentId").toString());
        String relationship = body.getOrDefault("relationship", "GUARDIAN").toString();
        boolean isPrimary = Boolean.TRUE.equals(body.get("isPrimary"));
        return ResponseEntity.ok(parentService.linkChild(parentId, studentId, relationship, isPrimary));
    }

    @DeleteMapping("/{parentId}/unlink/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParentResponse> unlinkChild(@PathVariable Long parentId, @PathVariable Long studentId) {
        return ResponseEntity.ok(parentService.unlinkChild(parentId, studentId));
    }

    @GetMapping("/my-children")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<List<ParentResponse.ChildSummary>> getMyChildren() {
        String username = SecurityUtils.currentUsername();
        Long parentId = userRepository.findByUsername(username)
                .map(u -> u.getId())
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        return ResponseEntity.ok(parentService.getMyChildren(parentId));
    }
}