package com.stanford.schoolbackend.core.security;

import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Objects;

public class SecurityUtils {

    public static String currentUserEmail() {
        return Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
    }

    public static boolean currentUserHasRole(String role) {
        return Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication())
                .getAuthorities().stream()
                .anyMatch(a -> Objects.equals(a.getAuthority(), "ROLE_" + role));
    }
}