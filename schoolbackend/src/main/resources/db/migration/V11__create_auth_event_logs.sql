CREATE TABLE auth_event_logs (
                                 id BIGSERIAL PRIMARY KEY,
                                 username_attempted VARCHAR(255),
                                 user_id BIGINT REFERENCES users(id),
                                 event_type VARCHAR(50) NOT NULL,
                                 ip_address VARCHAR(64),
                                 occurred_at TIMESTAMP NOT NULL
);