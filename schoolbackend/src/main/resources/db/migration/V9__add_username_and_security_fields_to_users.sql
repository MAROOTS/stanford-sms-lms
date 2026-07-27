ALTER TABLE users ADD COLUMN username VARCHAR(255);
UPDATE users SET username = email WHERE username IS NULL;
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT uk_users_username UNIQUE (username);

ALTER TABLE users ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN account_locked BOOLEAN NOT NULL DEFAULT false;

-- existing dev/test accounts shouldn't get force-redirected to a change-password screen
UPDATE users SET must_change_password = false;