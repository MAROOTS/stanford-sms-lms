ALTER TABLE class_sections ADD COLUMN school_id BIGINT REFERENCES schools(id);
UPDATE class_sections SET school_id = (SELECT id FROM schools WHERE slug = 'stanford');
ALTER TABLE class_sections ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE class_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_class_sections ON class_sections
    USING (school_id = current_setting('app.current_school_id', true)::bigint);

ALTER TABLE terms ADD COLUMN school_id BIGINT REFERENCES schools(id);
UPDATE terms SET school_id = (SELECT id FROM schools WHERE slug = 'stanford');
ALTER TABLE terms ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_terms ON terms
    USING (school_id = current_setting('app.current_school_id', true)::bigint);