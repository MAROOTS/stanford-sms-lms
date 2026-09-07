CREATE TABLE IF NOT EXISTS fee_structure_lines (
                                                       id              BIGSERIAL PRIMARY KEY,
                                                       school_id       BIGINT NOT NULL REFERENCES schools(id),
                                                       grade_level_id  BIGINT NOT NULL REFERENCES grade_levels(id),
                                                       fee_item_id     BIGINT NOT NULL REFERENCES fee_items(id),
                                                       amount          NUMERIC(12, 2) NOT NULL,
                                                       CONSTRAINT uk_fee_structure_grade_item UNIQUE (grade_level_id, fee_item_id)
);

ALTER TABLE fee_structure_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structure_lines FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_fee_structure_lines ON fee_structure_lines;
CREATE POLICY tenant_isolation_fee_structure_lines ON fee_structure_lines
    USING (school_id = current_setting('app.current_school_id', true)::bigint);