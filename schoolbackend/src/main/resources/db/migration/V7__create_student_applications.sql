CREATE TABLE student_applications (
                                      id BIGSERIAL PRIMARY KEY,
                                      first_name VARCHAR(255) NOT NULL,
                                      last_name VARCHAR(255) NOT NULL,
                                      date_of_birth DATE,
                                      desired_grade_level_id BIGINT REFERENCES grade_levels(id),
                                      guardian_name VARCHAR(255) NOT NULL,
                                      guardian_email VARCHAR(255) NOT NULL,
                                      guardian_phone VARCHAR(50) NOT NULL,
                                      student_email VARCHAR(255),
                                      previous_school VARCHAR(255),
                                      notes TEXT,
                                      status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
                                      submitted_at TIMESTAMP NOT NULL,
                                      decided_at TIMESTAMP,
                                      enrolled_student_id BIGINT REFERENCES students(id)
);