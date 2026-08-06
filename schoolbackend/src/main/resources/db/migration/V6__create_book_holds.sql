CREATE TABLE book_holds (
                            id BIGSERIAL PRIMARY KEY,
                            book_id BIGINT NOT NULL REFERENCES books(id),
                            borrower_id BIGINT NOT NULL REFERENCES users(id),
                            requested_at TIMESTAMP NOT NULL,
                            notified BOOLEAN NOT NULL DEFAULT false,
                            fulfilled BOOLEAN NOT NULL DEFAULT false
);