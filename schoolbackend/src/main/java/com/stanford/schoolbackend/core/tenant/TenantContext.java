package com.stanford.schoolbackend.core.tenant;

import org.springframework.stereotype.Component;

@Component
public class TenantContext {

    private static final ThreadLocal<Long> CURRENT_SCHOOL_ID = new ThreadLocal<>();

    public void setCurrentSchool(Long schoolId) {
        CURRENT_SCHOOL_ID.set(schoolId);
    }

    public Long getCurrentSchool() {
        return CURRENT_SCHOOL_ID.get();
    }

    public void clear() {
        CURRENT_SCHOOL_ID.remove();
    }

    public void runAs(Long schoolId, Runnable action) {
        Long previous = CURRENT_SCHOOL_ID.get();
        setCurrentSchool(schoolId);
        try {
            action.run();
        } finally {
            if (previous != null) {
                CURRENT_SCHOOL_ID.set(previous);
            } else {
                CURRENT_SCHOOL_ID.remove();
            }
        }
    }
}