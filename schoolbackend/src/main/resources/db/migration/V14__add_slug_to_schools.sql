ALTER TABLE schools ADD COLUMN slug VARCHAR(100);
UPDATE schools SET slug = 'stanford' WHERE name = 'Stanford';
ALTER TABLE schools ALTER COLUMN slug SET NOT NULL;
ALTER TABLE schools ADD CONSTRAINT uk_schools_slug UNIQUE (slug);