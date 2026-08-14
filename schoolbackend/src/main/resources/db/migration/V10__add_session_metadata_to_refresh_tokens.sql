ALTER TABLE refresh_tokens ADD COLUMN ip_address VARCHAR(64);
ALTER TABLE refresh_tokens ADD COLUMN user_agent VARCHAR(500);