package com.stanford.schoolbackend.core.admin;

import com.stanford.schoolbackend.core.admin.dto.CreatedUserResponse;
import com.stanford.schoolbackend.core.auth.dto.AdminResetPasswordResponse;
import com.stanford.schoolbackend.core.auth.dto.GenerateUsernameResponse;
import com.stanford.schoolbackend.core.auth.dto.RegisterRequest;
import com.stanford.schoolbackend.core.enums.UserRole;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CreatedUserResponse> createUser(@Valid @RequestBody RegisterRequest request) {
        if (request.getRole()==UserRole.STUDENT){
            throw new IllegalArgumentException(
                    "Students must be created through the Admissions process, not this endpoint."
            );
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(adminUserService.createUser(request));
    }

    @GetMapping("/generate-username")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GenerateUsernameResponse> generateUsername(@RequestParam UserRole role) {
        return ResponseEntity.ok(adminUserService.generateUsername(role));
    }

    @PostMapping("/{userId}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminResetPasswordResponse> resetPassword(@PathVariable Long userId) {
        return ResponseEntity.ok(adminUserService.resetPassword(userId));
    }

    @PostMapping("/{userId}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> unlockAccount(@PathVariable Long userId) {
        adminUserService.unlockAccount(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CreatedUserResponse>> listByRoles(@RequestParam List<UserRole> roles) {
        return ResponseEntity.ok(adminUserService.listByRoles(roles));
    }
}