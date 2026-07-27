package com.stanford.schoolbackend.core.security;

import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static String currentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    public static boolean currentUserHasRole(String role) {
        return SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }
}