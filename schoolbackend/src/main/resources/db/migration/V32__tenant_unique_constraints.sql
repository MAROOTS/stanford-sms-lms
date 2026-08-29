-- terms
ALTER TABLE terms DROP CONSTRAINT IF EXISTS ukqdbo5nicw4lj82c8858ds6q76;
ALTER TABLE terms DROP CONSTRAINT IF EXISTS uk_terms_school_name;
ALTER TABLE terms ADD CONSTRAINT uk_terms_school_name UNIQUE (school_id, name);

-- grade_levels
ALTER TABLE grade_levels DROP CONSTRAINT IF EXISTS uktql7fiuaeq82do1lqgg4fi0iq;
ALTER TABLE grade_levels DROP CONSTRAINT IF EXISTS uk_grade_levels_school_name;
ALTER TABLE grade_levels ADD CONSTRAINT uk_grade_levels_school_name UNIQUE (school_id, name);

-- subjects
ALTER TABLE subjects DROP CONSTRAINT IF EXISTS ukaodt3utnw0lsov4k9ta88dbpr;
ALTER TABLE subjects DROP CONSTRAINT IF EXISTS uk_subjects_school_name;
ALTER TABLE subjects ADD CONSTRAINT uk_subjects_school_name UNIQUE (school_id, name);

-- fee_items
ALTER TABLE fee_items DROP CONSTRAINT IF EXISTS ukofvne616hqdbctydubtl913r7;
ALTER TABLE fee_items DROP CONSTRAINT IF EXISTS uk_fee_items_school_name;
ALTER TABLE fee_items ADD CONSTRAINT uk_fee_items_school_name UNIQUE (school_id, name);

-- books (isbn can be null; Postgres allows multiple NULLs in a unique constraint)
ALTER TABLE books DROP CONSTRAINT IF EXISTS ukkibbepcitr0a3cpk3rfr7nihn;
ALTER TABLE books DROP CONSTRAINT IF EXISTS uk_books_school_isbn;
ALTER TABLE books ADD CONSTRAINT uk_books_school_isbn UNIQUE (school_id, isbn);