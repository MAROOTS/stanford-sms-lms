package com.stanford.schoolbackend.core.security;

import com.stanford.schoolbackend.core.user.User;
import com.stanford.schoolbackend.core.user.UserRepository;
import com.stanford.schoolbackend.sms.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component("securityUtils")
@RequiredArgsConstructor
public class SecurityUtils {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    /**
     * Returns the email of the currently authenticated user.
     */
    public static String currentUserEmail() {
        return Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
    }

    /**
     * Checks if the current user has the given role.
     */
    public static boolean currentUserHasRole(String role) {
        return Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication())
                .getAuthorities().stream()
                .anyMatch(a -> Objects.equals(a.getAuthority(), "ROLE_" + role));
    }

    /**
     * Checks if the currently authenticated user owns the given student ID.
     * Used in @PreAuthorize SpEL expressions to allow students to access their own data.
     *
     * Usage: @PreAuthorize("hasAnyRole('ADMIN','TEACHER') or @securityUtils.isSelf(#studentId)")
     */
    public boolean isSelf(Long studentId) {
        if (studentId == null) return false;
        String email = currentUserEmail();
        return studentRepository.findByEmail(email)
                .map(s -> s.getId().equals(studentId))
                .orElse(false);
    }

    /**
     * Checks if the currently authenticated user is the given user ID.
     */
    public boolean isSelfUser(Long userId) {
        if (userId == null) return false;
        String email = currentUserEmail();
        return userRepository.findByEmail(email)
                .map(u -> u.getId().equals(userId))
                .orElse(false);
    }
}
