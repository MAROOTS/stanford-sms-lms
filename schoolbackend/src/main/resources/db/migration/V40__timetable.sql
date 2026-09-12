CREATE TABLE timetable_periods (
                                   id          BIGSERIAL PRIMARY KEY,
                                   school_id   BIGINT NOT NULL REFERENCES schools(id),
                                   name        VARCHAR(80) NOT NULL,
                                   sort_order  INT NOT NULL,
                                   start_time  TIME NOT NULL,
                                   end_time    TIME NOT NULL,
                                   break_period BOOLEAN NOT NULL DEFAULT false,
                                   UNIQUE (school_id, sort_order)
);

CREATE TABLE timetable_slots (
                                 id                       BIGSERIAL PRIMARY KEY,
                                 school_id                BIGINT NOT NULL REFERENCES schools(id),
                                 class_section_id         BIGINT NOT NULL REFERENCES class_sections(id),
                                 period_id                BIGINT NOT NULL REFERENCES timetable_periods(id) ON DELETE CASCADE,
                                 day_of_week              SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 5),
                                 teaching_assignment_id   BIGINT REFERENCES teaching_assignments(id) ON DELETE SET NULL,
                                 room                     VARCHAR(80),
                                 UNIQUE (class_section_id, period_id, day_of_week)
);

ALTER TABLE timetable_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_periods FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_timetable_periods ON timetable_periods
    USING (school_id = current_setting('app.current_school_id', true)::bigint);

ALTER TABLE timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_slots FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_timetable_slots ON timetable_slots
    USING (school_id = current_setting('app.current_school_id', true)::bigint);