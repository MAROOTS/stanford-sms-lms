CREATE TABLE notification_preferences (
                                          id BIGSERIAL PRIMARY KEY,
                                          user_id BIGINT NOT NULL REFERENCES users(id),
                                          notification_type VARCHAR(50) NOT NULL,
                                          enabled BOOLEAN NOT NULL DEFAULT true,
                                          CONSTRAINT uk_notification_pref UNIQUE (user_id, notification_type)
);