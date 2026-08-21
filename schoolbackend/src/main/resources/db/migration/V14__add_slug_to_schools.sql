ALTER TABLE schools ADD COLUMN slug VARCHAR(100);

UPDATE schools SET slug = 'stanford' WHERE name = 'Stanford';
UPDATE schools SET slug = 'school-' || id WHERE slug IS NULL;

ALTER TABLE schools ALTER COLUMN slug SET NOT NULL;
ALTER TABLE schools ADD CONSTRAINT uk_schools_slug UNIQUE (slug);