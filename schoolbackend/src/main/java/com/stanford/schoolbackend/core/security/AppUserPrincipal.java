package com.stanford.schoolbackend.core.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

@Getter
public class AppUserPrincipal extends User {

    private final Long userId;
    private final boolean mustChangePassword;
    private final Long schoolId;

    public AppUserPrincipal(Long userId, String username, String password, boolean enabled,
                            boolean accountNonLocked, boolean mustChangePassword,
                            Collection<? extends GrantedAuthority> authorities, Long schoolId) {
        super(username, password, enabled, true, true, accountNonLocked, authorities);
        this.userId = userId;
        this.mustChangePassword = mustChangePassword;
        this.schoolId = schoolId;
    }
}