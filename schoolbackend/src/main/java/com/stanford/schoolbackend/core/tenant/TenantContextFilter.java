package com.stanford.schoolbackend.core.tenant;

import com.stanford.schoolbackend.core.security.SecurityUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class TenantContextFilter extends OncePerRequestFilter {

    private final TenantContext tenantContext;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                tenantContext.setCurrentSchool(SecurityUtils.currentSchoolId());
            } else {
                tenantContext.clear();
            }
            filterChain.doFilter(request, response);
        } finally {
            tenantContext.clear();
        }
    }
}