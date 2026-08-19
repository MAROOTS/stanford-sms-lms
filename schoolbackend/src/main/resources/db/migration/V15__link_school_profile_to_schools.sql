ALTER TABLE school_profile ADD COLUMN school_id BIGINT REFERENCES schools(id);
UPDATE school_profile SET school_id = (SELECT id FROM schools WHERE slug = 'stanford') WHERE id = 1;
ALTER TABLE school_profile ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE school_profile ADD CONSTRAINT uk_school_profile_school_id UNIQUE (school_id);
SELECT setval(pg_get_serial_sequence('school_profile', 'id'), COALESCE((SELECT MAX(id) FROM school_profile), 1));