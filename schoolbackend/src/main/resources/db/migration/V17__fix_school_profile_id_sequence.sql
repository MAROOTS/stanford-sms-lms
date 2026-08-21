CREATE SEQUENCE IF NOT EXISTS school_profile_id_seq;
ALTER TABLE school_profile ALTER COLUMN id SET DEFAULT nextval('school_profile_id_seq');
ALTER SEQUENCE school_profile_id_seq OWNED BY school_profile.id;
SELECT setval('school_profile_id_seq', COALESCE((SELECT MAX(id) FROM school_profile), 0) + 1, false);