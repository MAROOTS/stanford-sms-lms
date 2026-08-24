ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_teachers ON teachers
    USING (
    id IN (SELECT id FROM users WHERE school_id = current_setting('app.current_school_id', true)::bigint)
    );

ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_parents ON parents
    USING (
    id IN (SELECT id FROM users WHERE school_id = current_setting('app.current_school_id', true)::bigint)
    );