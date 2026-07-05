package com.stanford.schoolbackend.sms.attendance;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByCourseId(Long courseId);
}