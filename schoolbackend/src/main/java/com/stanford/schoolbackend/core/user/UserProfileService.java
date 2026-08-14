package com.stanford.schoolbackend.core.user;

import com.stanford.schoolbackend.core.exception.EmailAlreadyExistsException;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.core.user.dto.MeResponse;
import com.stanford.schoolbackend.core.user.dto.UpdateProfileRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;

    public MeResponse getMe() {
        return toResponse(getCurrentUser());
    }

    public MeResponse updateMe(UpdateProfileRequest request) {
        User user = getCurrentUser();

        if (!user.getEmail().equalsIgnoreCase(request.getEmail())
                && userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());

        return toResponse(userRepository.save(user));
    }

    private User getCurrentUser() {
        return userRepository.findByUsername(SecurityUtils.currentUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private MeResponse toResponse(User u) {
        return MeResponse.builder()
                .id(u.getId()).username(u.getUsername())
                .firstName(u.getFirstName()).lastName(u.getLastName())
                .email(u.getEmail()).role(u.getRole().name())
                .build();
    }
}