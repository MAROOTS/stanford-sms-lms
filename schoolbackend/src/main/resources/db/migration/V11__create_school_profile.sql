CREATE TABLE school_profile (
                                id BIGINT PRIMARY KEY,
                                name VARCHAR(255) NOT NULL,
                                logo_object_key VARCHAR(500),
                                address TEXT,
                                contact_email VARCHAR(255),
                                contact_phone VARCHAR(50)
);