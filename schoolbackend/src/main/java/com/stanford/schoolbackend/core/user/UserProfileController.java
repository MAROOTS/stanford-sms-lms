package com.stanford.schoolbackend.core.user;

import com.stanford.schoolbackend.core.user.dto.MeResponse;
import com.stanford.schoolbackend.core.user.dto.UpdateProfileRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/me")
    public ResponseEntity<MeResponse> getMe() {
        return ResponseEntity.ok(userProfileService.getMe());
    }

    @PutMapping("/me")
    public ResponseEntity<MeResponse> updateMe(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userProfileService.updateMe(request));
    }
}