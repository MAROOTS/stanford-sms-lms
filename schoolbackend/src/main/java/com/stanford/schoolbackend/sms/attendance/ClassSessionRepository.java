package com.stanford.schoolbackend.sms.attendance;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {
    List<ClassSession> findByClassSectionIdOrderBySessionDateDesc(Long classSectionId);
    Optional<ClassSession> findByClassSectionIdAndSessionDate(Long classSectionId, LocalDate sessionDate);
    List<ClassSession> findBySessionDate(LocalDate date);
}