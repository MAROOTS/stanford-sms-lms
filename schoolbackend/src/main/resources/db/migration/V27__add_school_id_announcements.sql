ALTER TABLE announcements ADD COLUMN school_id BIGINT REFERENCES schools(id);
UPDATE announcements SET school_id = (SELECT id FROM schools WHERE slug = 'stanford');
ALTER TABLE announcements ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_announcements ON announcements
    USING (school_id = current_setting('app.current_school_id', true)::bigint);