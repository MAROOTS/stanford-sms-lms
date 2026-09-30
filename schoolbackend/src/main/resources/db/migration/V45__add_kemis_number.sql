ALTER TABLE students ADD COLUMN IF NOT EXISTS kemis_number VARCHAR(50);

CREATE UNIQUE INDEX IF NOT EXISTS uk_students_kemis
    ON students (kemis_number)
    WHERE kemis_number IS NOT NULL AND kemis_number <> '';