package com.stanford.schoolbackend.core.auth;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthEventLogRepository extends JpaRepository<AuthEventLog, Long> {
}