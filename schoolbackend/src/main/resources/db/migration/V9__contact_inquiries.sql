CREATE TABLE contact_inquiries (
                                   id BIGSERIAL PRIMARY KEY,
                                   school_name VARCHAR(255) NOT NULL,
                                   contact_name VARCHAR(255) NOT NULL,
                                   email VARCHAR(255) NOT NULL,
                                   phone VARCHAR(50),
                                   student_count_estimate INTEGER,
                                   message TEXT NOT NULL,
                                   ip_address VARCHAR(64),
                                   status VARCHAR(50) NOT NULL DEFAULT 'NEW',
                                   submitted_at TIMESTAMP NOT NULL
);