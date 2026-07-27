CREATE TABLE username_sequences (
                                    id BIGSERIAL PRIMARY KEY,
                                    sequence_key VARCHAR(50) NOT NULL UNIQUE,
                                    last_value INTEGER NOT NULL DEFAULT 0
);