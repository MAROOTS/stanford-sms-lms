ALTER TABLE username_sequences ADD COLUMN school_id BIGINT REFERENCES schools(id);
UPDATE username_sequences SET school_id = (SELECT id FROM schools WHERE slug = 'stanford');
ALTER TABLE username_sequences ALTER COLUMN school_id SET NOT NULL;

ALTER TABLE username_sequences DROP CONSTRAINT IF EXISTS username_sequences_sequence_key_key;
ALTER TABLE username_sequences ADD CONSTRAINT uk_username_seq_school_key UNIQUE (school_id, sequence_key);

ALTER TABLE username_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_username_sequences ON username_sequences
    USING (school_id = current_setting('app.current_school_id', true)::bigint);