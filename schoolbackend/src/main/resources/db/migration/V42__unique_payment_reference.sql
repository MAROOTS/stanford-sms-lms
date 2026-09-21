ALTER TABLE fee_payments
    ADD COLUMN IF NOT EXISTS school_id BIGINT REFERENCES schools(id);

UPDATE fee_payments fp
SET school_id = fi.school_id
FROM fee_invoices fi
WHERE fp.invoice_id = fi.id
  AND fp.school_id IS NULL;

ALTER TABLE fee_payments
    ALTER COLUMN school_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uk_fee_payments_school_reference
    ON fee_payments (school_id, lower(trim(reference)))
    WHERE reference IS NOT NULL AND length(trim(reference)) > 0;