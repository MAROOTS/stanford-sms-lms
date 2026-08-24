ALTER TABLE fee_invoices
    ADD COLUMN school_id BIGINT REFERENCES schools(id);

UPDATE fee_invoices
SET school_id = (
    SELECT id
    FROM schools
    WHERE slug = 'stanford'
);

ALTER TABLE fee_invoices
    ALTER COLUMN school_id SET NOT NULL;

ALTER TABLE fee_invoices
    ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_fee_invoices
    ON fee_invoices
    USING (
    school_id = current_setting('app.current_school_id', true)::bigint
    );