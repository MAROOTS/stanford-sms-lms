ALTER TABLE fee_invoices
    ADD COLUMN IF NOT EXISTS invoice_number varchar(40);

CREATE TABLE IF NOT EXISTS invoice_sequences (
                                                 school_id  BIGINT NOT NULL REFERENCES schools(id),
                                                 year       INT    NOT NULL,
                                                 last_value INT    NOT NULL DEFAULT 0,
                                                 PRIMARY KEY (school_id, year)
);

-- number existing invoices per school + year, in created order
WITH numbered AS (
    SELECT id,
           school_id,
           EXTRACT(YEAR FROM created_at)::int AS yr,
           ROW_NUMBER() OVER (
               PARTITION BY school_id, EXTRACT(YEAR FROM created_at)
               ORDER BY created_at, id
               ) AS n
    FROM fee_invoices
    WHERE invoice_number IS NULL
)
UPDATE fee_invoices f
SET invoice_number = 'INV-' || numbered.yr || '-' || LPAD(numbered.n::text, 4, '0')
FROM numbered
WHERE f.id = numbered.id;

INSERT INTO invoice_sequences (school_id, year, last_value)
SELECT school_id,
       EXTRACT(YEAR FROM created_at)::int,
       COUNT(*)::int
FROM fee_invoices
GROUP BY school_id, EXTRACT(YEAR FROM created_at)::int
ON CONFLICT (school_id, year)
    DO UPDATE SET last_value = GREATEST(invoice_sequences.last_value, EXCLUDED.last_value);

ALTER TABLE fee_invoices ALTER COLUMN invoice_number SET NOT NULL;

ALTER TABLE fee_invoices DROP CONSTRAINT IF EXISTS uk_fee_invoices_school_number;
ALTER TABLE fee_invoices ADD CONSTRAINT uk_fee_invoices_school_number
    UNIQUE (school_id, invoice_number);

ALTER TABLE invoice_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_sequences FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_invoice_sequences ON invoice_sequences;
CREATE POLICY tenant_isolation_invoice_sequences ON invoice_sequences
    USING (school_id = current_setting('app.current_school_id', true)::bigint);