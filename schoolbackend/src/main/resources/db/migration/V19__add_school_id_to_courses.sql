ALTER TABLE courses ADD COLUMN school_id BIGINT REFERENCES schools(id);
UPDATE courses SET school_id = (SELECT id FROM schools WHERE slug = 'stanford');
ALTER TABLE courses ALTER COLUMN school_id SET NOT NULL;

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_courses ON courses
    USING (school_id = current_setting('app.current_school_id', true)::bigint);