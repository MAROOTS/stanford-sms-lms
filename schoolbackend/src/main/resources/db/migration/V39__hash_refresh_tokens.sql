CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- existing rows are plaintext UUIDs (36 chars); hashed value is 64 hex chars
UPDATE refresh_tokens
SET token = encode(digest(token, 'sha256'), 'hex')
WHERE length(token) = 36;