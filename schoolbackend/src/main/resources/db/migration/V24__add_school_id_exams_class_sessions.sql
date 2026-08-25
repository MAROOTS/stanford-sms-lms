ALTER TABLE exams ADD COLUMN school_id BIGINT REFERENCES schools(id);
UPDATE exams SET school_id = (SELECT id FROM schools WHERE slug = 'stanford');
ALTER TABLE exams ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_exams ON exams
    USING (school_id = current_setting('app.current_school_id', true)::bigint);

ALTER TABLE class_sessions ADD COLUMN school_id BIGINT REFERENCES schools(id);
UPDATE class_sessions SET school_id = (SELECT id FROM schools WHERE slug = 'stanford');
ALTER TABLE class_sessions ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_class_sessions ON class_sessions
    USING (school_id = current_setting('app.current_school_id', true)::bigint);