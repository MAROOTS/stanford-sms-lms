CREATE TABLE teaching_assignments (
                                      id              BIGSERIAL PRIMARY KEY,
                                      school_id       BIGINT NOT NULL REFERENCES schools(id),
                                      teacher_id      BIGINT NOT NULL REFERENCES teachers(id),
                                      subject_id      BIGINT NOT NULL REFERENCES subjects(id),
                                      class_section_id BIGINT NOT NULL REFERENCES class_sections(id),
                                      CONSTRAINT uk_teaching_class_subject UNIQUE (class_section_id, subject_id)
);

ALTER TABLE teaching_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_assignments FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_teaching_assignments ON teaching_assignments
    USING (school_id = current_setting('app.current_school_id', true)::bigint);