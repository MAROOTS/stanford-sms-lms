ALTER TABLE parent_student DROP CONSTRAINT parent_student_pkey;
ALTER TABLE parent_student ADD COLUMN id BIGSERIAL;
ALTER TABLE parent_student ADD PRIMARY KEY (id);
ALTER TABLE parent_student ADD CONSTRAINT uk_parent_student UNIQUE (parent_id, student_id);