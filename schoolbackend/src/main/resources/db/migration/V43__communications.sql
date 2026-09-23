CREATE TABLE communication_campaigns (
                                         id              BIGSERIAL PRIMARY KEY,
                                         school_id       BIGINT NOT NULL REFERENCES schools (id),
                                         created_by_id   BIGINT REFERENCES users (id),
                                         title           VARCHAR(160) NOT NULL,
                                         body            TEXT NOT NULL,
                                         audience        VARCHAR(40) NOT NULL,
                                         class_section_id BIGINT REFERENCES class_sections (id),
                                         grade_level_id  BIGINT REFERENCES grade_levels (id),
                                         recipient_count INT NOT NULL DEFAULT 0,
                                         sent_count      INT NOT NULL DEFAULT 0,
                                         failed_count    INT NOT NULL DEFAULT 0,
                                         skipped_count   INT NOT NULL DEFAULT 0,
                                         status          VARCHAR(20) NOT NULL,
                                         created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                         sent_at         TIMESTAMPTZ
);

CREATE TABLE communication_recipients (
                                          id              BIGSERIAL PRIMARY KEY,
                                          campaign_id     BIGINT NOT NULL REFERENCES communication_campaigns (id) ON DELETE CASCADE,
                                          parent_id       BIGINT REFERENCES users (id),
                                          student_id      BIGINT REFERENCES users (id),
                                          phone           VARCHAR(32) NOT NULL,
                                          status          VARCHAR(20) NOT NULL,
                                          provider_id     VARCHAR(120),
                                          failure_reason  VARCHAR(500),
                                          sent_at         TIMESTAMPTZ
);

CREATE INDEX idx_comm_campaigns_school ON communication_campaigns (school_id, created_at DESC);
CREATE INDEX idx_comm_recipients_campaign ON communication_recipients (campaign_id);