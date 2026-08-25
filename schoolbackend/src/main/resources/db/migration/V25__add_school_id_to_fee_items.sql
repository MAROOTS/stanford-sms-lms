ALTER TABLE fee_items ADD COLUMN school_id BIGINT REFERENCES schools(id);
UPDATE fee_items SET school_id = (SELECT id FROM schools WHERE slug = 'stanford');
ALTER TABLE fee_items ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE fee_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_fee_items ON fee_items
    USING (school_id = current_setting('app.current_school_id', true)::bigint);
