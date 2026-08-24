ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_students ON students
    USING (
    id IN (SELECT id FROM users WHERE school_id = current_setting('app.current_school_id', true)::bigint)
    );