-- grade_levels
ALTER TABLE grade_levels ADD COLUMN school_id BIGINT REFERENCES schools(id);
UPDATE grade_levels SET school_id = (SELECT id FROM schools WHERE slug = 'stanford');
ALTER TABLE grade_levels ALTER COLUMN school_id SET NOT NULL;

DO $$
    DECLARE
        found_constraint text;
    BEGIN
        SELECT con.conname INTO found_constraint
        FROM pg_constraint con
                 JOIN pg_class rel ON rel.oid = con.conrelid
                 JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
        WHERE rel.relname = 'grade_levels' AND att.attname = 'name' AND con.contype = 'u';

        IF found_constraint IS NOT NULL THEN
            EXECUTE format('ALTER TABLE grade_levels DROP CONSTRAINT %I', found_constraint);
        END IF;
    END $$;

ALTER TABLE grade_levels ADD CONSTRAINT uk_grade_levels_school_name UNIQUE (school_id, name);

ALTER TABLE grade_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_grade_levels ON grade_levels
    USING (school_id = current_setting('app.current_school_id', true)::bigint);

-- subjects
ALTER TABLE subjects ADD COLUMN school_id BIGINT REFERENCES schools(id);
UPDATE subjects SET school_id = (SELECT id FROM schools WHERE slug = 'stanford');
ALTER TABLE subjects ALTER COLUMN school_id SET NOT NULL;

DO $$
    DECLARE
        found_constraint text;
    BEGIN
        SELECT con.conname INTO found_constraint
        FROM pg_constraint con
                 JOIN pg_class rel ON rel.oid = con.conrelid
                 JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
        WHERE rel.relname = 'subjects' AND att.attname = 'name' AND con.contype = 'u';

        IF found_constraint IS NOT NULL THEN
            EXECUTE format('ALTER TABLE subjects DROP CONSTRAINT %I', found_constraint);
        END IF;
    END $$;

ALTER TABLE subjects ADD CONSTRAINT uk_subjects_school_name UNIQUE (school_id, name);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_subjects ON subjects
    USING (school_id = current_setting('app.current_school_id', true)::bigint);