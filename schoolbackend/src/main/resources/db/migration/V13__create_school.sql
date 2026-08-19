CREATE TABLE schools (
                         id BIGSERIAL PRIMARY KEY,
                         name VARCHAR(255) NOT NULL UNIQUE,
                         status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
                         created_at TIMESTAMP NOT NULL
);

INSERT INTO schools (name, status, created_at) VALUES ('Stanford', 'ACTIVE', now());

ALTER TABLE users ADD COLUMN school_id BIGINT REFERENCES schools(id);

UPDATE users SET school_id = (SELECT id FROM schools WHERE name = 'Stanford');