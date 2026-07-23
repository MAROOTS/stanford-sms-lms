DO $$
    DECLARE
        found_constraint text;
    BEGIN
        SELECT con.conname INTO found_constraint
        FROM pg_constraint con
                 JOIN pg_class rel ON rel.oid = con.conrelid
                 JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
        WHERE rel.relname = 'users'
          AND att.attname = 'role'
          AND con.contype = 'c';

        IF found_constraint IS NOT NULL THEN
            EXECUTE format('ALTER TABLE users DROP CONSTRAINT %I', found_constraint);
        END IF;
    END $$;