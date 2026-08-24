package com.stanford.schoolbackend.core.tenant;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.hibernate.Session;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TenantContext {

    private final EntityManager entityManager;

    /**
     * Tells Postgres which school's rows are visible for the rest of this
     * session. null (Platform Admin, or nobody logged in yet) maps to "-1" —
     * an ID that will never exist, so RLS policies correctly show nothing.
     */
    public void setCurrentSchool(Long schoolId) {
        String value = schoolId != null ? schoolId.toString() : "-1";
        entityManager.unwrap(Session.class).doWork(connection -> {
            try (var stmt = connection.prepareStatement("SELECT set_config('app.current_school_id', ?, false)")) {
                stmt.setString(1, value);
                stmt.execute();
            }
        });
    }

    public void clear() {
        setCurrentSchool(null);
    }

    /** For scheduled jobs — no HTTP request means no automatic context, so they set it explicitly, per school. */
    public void runAs(Long schoolId, Runnable action) {
        setCurrentSchool(schoolId);
        try {
            action.run();
        } finally {
            clear();
        }
    }
}