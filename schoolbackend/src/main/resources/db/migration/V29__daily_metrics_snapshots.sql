ALTER TABLE daily_metrics_snapshots ADD COLUMN school_id BIGINT REFERENCES schools(id);
UPDATE daily_metrics_snapshots SET school_id = (SELECT id FROM schools WHERE slug = 'stanford');
ALTER TABLE daily_metrics_snapshots ALTER COLUMN school_id SET NOT NULL;

DO $$
    DECLARE
        found_constraint text;
    BEGIN
        SELECT con.conname INTO found_constraint
        FROM pg_constraint con
                 JOIN pg_class rel ON rel.oid = con.conrelid
        WHERE rel.relname = 'daily_metrics_snapshots' AND con.contype = 'u';

        IF found_constraint IS NOT NULL THEN
            EXECUTE format('ALTER TABLE daily_metrics_snapshots DROP CONSTRAINT %I', found_constraint);
        END IF;
    END $$;

ALTER TABLE daily_metrics_snapshots ADD CONSTRAINT uk_snapshot_school_date UNIQUE (school_id, snapshot_date);

ALTER TABLE daily_metrics_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_daily_metrics_snapshots ON daily_metrics_snapshots
    USING (school_id = current_setting('app.current_school_id', true)::bigint);