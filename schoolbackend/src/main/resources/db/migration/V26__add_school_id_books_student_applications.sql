ALTER TABLE books ADD COLUMN school_id BIGINT REFERENCES schools(id);
UPDATE books SET school_id = (SELECT id FROM schools WHERE slug = 'stanford');
ALTER TABLE books ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_books ON books
    USING (school_id = current_setting('app.current_school_id', true)::bigint);

ALTER TABLE student_applications ADD COLUMN school_id BIGINT REFERENCES schools(id);
UPDATE student_applications SET school_id = (SELECT id FROM schools WHERE slug = 'stanford');
ALTER TABLE student_applications ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE student_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_student_applications ON student_applications
    USING (school_id = current_setting('app.current_school_id', true)::bigint);